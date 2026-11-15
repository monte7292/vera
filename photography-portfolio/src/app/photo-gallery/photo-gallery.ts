import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  computed,
  effect,
  signal,
  viewChild
} from '@angular/core';
import { Revelar } from './revelar';


export interface Foto {
  titulo: string;
  categoria: string;
  imagen: string;
  ancho: number;
  alto: number;
}

@Component({
  selector: 'app-photo-gallery',
  imports: [Revelar],
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css',
  host: { '(document:keydown)': 'teclado($event)' }
})
export class PhotoGallery implements OnInit, OnDestroy {
  protected readonly fotos = signal<Foto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly categoriaActiva = signal('Todas');
  protected readonly indiceAbierto = signal<number | null>(null);
  protected readonly menuAbierto = signal(false);

  private readonly visor = viewChild<ElementRef<HTMLDialogElement>>('visor');

  private inicioX = 0;
  private inicioY = 0;
  private variosDedos = false;

  protected readonly categorias = computed(() => [
    'Todas',
    ...new Set(this.fotos().map((f) => f.categoria))
  ]);

  protected readonly fotosFiltradas = computed(() => {
    const categoria = this.categoriaActiva();
    const fotos = this.fotos();

    if (categoria !== 'Todas') {
      return fotos.filter((f) => f.categoria === categoria);
    }

    // En "Todas": primero las fijadas (en el orden de la lista), luego el resto
    const fijadas = this.fijadas
      .map((nombre) => fotos.find((f) => this.nombreArchivo(f) === nombre.toLowerCase()))
      .filter((f): f is Foto => !!f);

    const resto = fotos.filter((f) => !fijadas.includes(f));
    return [...fijadas, ...resto];
  });

  protected readonly conteos = computed(() => {
    const mapa = new Map<string, number>();
    const fotos = this.fotos();
    mapa.set('Todas', fotos.length);
    for (const f of fotos) {
      mapa.set(f.categoria, (mapa.get(f.categoria) ?? 0) + 1);
    }
    return mapa;
  });

  protected readonly fotoAbierta = computed(() => {
    const i = this.indiceAbierto();
    return i === null ? null : (this.fotosFiltradas()[i] ?? null);
  });

  constructor() {
    // Abre o cierra el <dialog> según el estado
    effect(() => {
      const abierto = this.indiceAbierto() !== null;
      const dialogo = this.visor()?.nativeElement;
      if (!dialogo) return;

      if (abierto && !dialogo.open) {
        dialogo.showModal();
        document.body.style.overflow = 'hidden';
      } else if (!abierto && dialogo.open) {
        dialogo.close();
        document.body.style.overflow = '';
      }
    });
  }

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

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  protected seleccionarCategoria(categoria: string, evento?: Event): void {
    this.cerrar();
    this.categoriaActiva.set(categoria);
    (evento?.currentTarget as HTMLElement | null)?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }

  protected alternarMenu(): void {
  this.menuAbierto.update((abierto) => !abierto);
}

protected cerrarMenu(): void {
  this.menuAbierto.set(false);
}

protected elegirCategoria(categoria: string): void {
  this.seleccionarCategoria(categoria);
  this.menuAbierto.set(false);
}

  protected abrir(indice: number): void {
    this.indiceAbierto.set(indice);
  }

  protected cerrar(): void {
    this.indiceAbierto.set(null);
  }

  // Se dispara con Esc o con el botón "atrás" del navegador
  protected alCerrarDialogo(): void {
    if (this.indiceAbierto() !== null) this.indiceAbierto.set(null);
    document.body.style.overflow = '';
  }

  protected siguiente(): void {
    const i = this.indiceAbierto();
    const total = this.fotosFiltradas().length;
    if (i === null || total === 0) return;
    this.indiceAbierto.set((i + 1) % total);
  }

  protected anterior(): void {
    const i = this.indiceAbierto();
    const total = this.fotosFiltradas().length;
    if (i === null || total === 0) return;
    this.indiceAbierto.set((i - 1 + total) % total);
  }

  protected clickFondo(evento: MouseEvent): void {
    if (evento.target === evento.currentTarget) this.cerrar();
  }

  protected teclado(evento: KeyboardEvent): void {
    if (evento.key === 'Escape' && this.menuAbierto()) {
      this.menuAbierto.set(false);
      return;
    }
    if (this.indiceAbierto() === null) return;
    if (evento.key === 'ArrowRight') this.siguiente();
    else if (evento.key === 'ArrowLeft') this.anterior();
  }

  protected tocarInicio(evento: TouchEvent): void {
    if (evento.touches.length > 1) {
      this.variosDedos = true;
      return;
    }
    this.variosDedos = false;
    this.inicioX = evento.touches[0].clientX;
    this.inicioY = evento.touches[0].clientY;
  }

  protected tocarFin(evento: TouchEvent): void {
    const eraPellizco = this.variosDedos;
    if (evento.touches.length === 0) this.variosDedos = false;

    // Si hay zoom o fue un pellizco, no interpretamos el gesto como swipe
    const conZoom = (window.visualViewport?.scale ?? 1) > 1.05;
    if (eraPellizco || conZoom) return;

    const toque = evento.changedTouches[0];
    const dx = toque.clientX - this.inicioX;
    const dy = toque.clientY - this.inicioY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) this.siguiente();
      else this.anterior();
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      this.cerrar();
    }
  }

  // Nombres de archivo de las fotos fijadas, en el orden en que quieres que salgan
  private readonly fijadas = [
    'img-2101-1M8Tqf.webp', //Coches
    'img-5266-1lQCCi.webp', //Motos
    'img-3096-1ML9nW.webp', //Motorsport
    'img-5490-14xeW0.webp', //Deportes
    'img-4737-1wGKO_.webp', //Widlife
    'img-0629-1e4v50.webp', //Eventos
  ];

  private nombreArchivo(foto: Foto): string {
    return (foto.imagen.split('/').pop() ?? '').toLowerCase();
  }

  protected estaFijada(foto: Foto): boolean {
    return (
      this.categoriaActiva() === 'Todas' &&
      this.fijadas.some((n) => n.toLowerCase() === this.nombreArchivo(foto))
    );
  }
}