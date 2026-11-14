import { Component, signal } from '@angular/core';

export interface Foto {
  titulo: string;
  categoria: string;
  imagen: string;
}

@Component({
  selector: 'app-photo-gallery',
  templateUrl: './photo-gallery.html',
  styleUrl: './photo-gallery.css'
})
export class PhotoGallery {
  protected readonly categorias = ['Todas', 'Retrato', 'Boda', 'Paisaje', 'Eventos', 'Arquitectura'];
  protected readonly categoriaActiva = signal('Todas');

  protected readonly fotos: Foto[] = [
    {
      titulo: 'Luz de ventana',
      categoria: 'Retrato',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=close-up%20studio%20portrait%20of%20a%20young%20woman%20with%20soft%20window%20light%2C%20shallow%20depth%20of%20field&image_size=square'
    },
    {
      titulo: 'Campo de trigo',
      categoria: 'Retrato',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=candid%20portrait%20of%20a%20smiling%20man%20outdoors%20in%20a%20wheat%20field%20at%20sunset&image_size=portrait_4_3'
    },
    {
      titulo: 'Hora dorada',
      categoria: 'Boda',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=bride%20and%20groom%20holding%20hands%20during%20golden%20hour%2C%20wedding%20photography%2C%20warm%20cinematic%20light&image_size=portrait_4_3'
    },
    {
      titulo: 'Detalles',
      categoria: 'Boda',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=wedding%20details%20close-up%20of%20rings%20and%20bouquet%20on%20a%20wooden%20table&image_size=square'
    },
    {
      titulo: 'Amanecer en la sierra',
      categoria: 'Paisaje',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=dramatic%20mountain%20range%20at%20sunrise%20with%20fog%20in%20the%20valley%2C%20wide%20landscape%20photography&image_size=landscape_16_9'
    },
    {
      titulo: 'Mar en calma',
      categoria: 'Paisaje',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=calm%20sea%20at%20dusk%20with%20long%20exposure%20smooth%20water%20and%20pink%20sky&image_size=landscape_4_3'
    },
    {
      titulo: 'Directo',
      categoria: 'Eventos',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=live%20concert%20photography%20of%20a%20crowd%20with%20stage%20lights%20and%20confetti&image_size=landscape_4_3'
    },
    {
      titulo: 'Geometría',
      categoria: 'Arquitectura',
      imagen:
        'https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=minimalist%20modern%20architecture%20in%20black%20and%20white%20with%20strong%20geometric%20lines&image_size=square'
    }
  ];

  protected seleccionarCategoria(categoria: string): void {
    this.categoriaActiva.set(categoria);
  }

  protected fotosFiltradas(): Foto[] {
    const categoria = this.categoriaActiva();
    return categoria === 'Todas' ? this.fotos : this.fotos.filter((foto) => foto.categoria === categoria);
  }
}
