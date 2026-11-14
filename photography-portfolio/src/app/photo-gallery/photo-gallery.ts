import { Component, OnInit, computed, signal } from '@angular/core';

export interface Foto {
  titulo: string;
  categoria: string;
  imagen: string;
  ancho: number;
  alto: number;
}

@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css'
})
export class PhotoGallery implements OnInit {
  protected readonly fotos = signal<Foto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly categoriaActiva = signal('Todas');

  protected readonly categorias = computed(() => [
    'Todas',
    ...new Set(this.fotos().map((f) => f.categoria))
  ]);

  protected readonly fotosFiltradas = computed(() => {
    const categoria = this.categoriaActiva();
    const fotos = this.fotos();
    return categoria === 'Todas' ? fotos : fotos.filter((f) => f.categoria === categoria);
  });

  async ngOnInit(): Promise<void> {
    try {
      const res = await fetch('/images/manifest.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(String(res.status));
      this.fotos.set(await res.json());
    } catch {
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }

  protected seleccionarCategoria(categoria: string): void {
    this.categoriaActiva.set(categoria);
  }
}