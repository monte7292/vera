import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { PhotoGallery } from './photo-gallery/photo-gallery';

@Component({
  selector: 'app-root',
  imports: [PhotoGallery],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  // Cambia la extensión si no son .jpg
  protected readonly imagenes = [
    'images/Motorsport/img-3096-1ML9nW.webp',
    'images/Motorsport/img-8044-1mPoGE.webp',
    'images/Motorsport/img-9300-1l6cVM.webp',
    'images/Coches/img-3360-178CAj.webp',
    'images/Motos/img-5257-1_IHgm.webp',
  ];
  protected readonly actual = signal(0);

  private temporizador?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Siempre empezar arriba al recargar
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    window.scrollTo(0, 0);

    this.temporizador = setInterval(() => {
      this.actual.update((i) => (i + 1) % this.imagenes.length);
    }, 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.temporizador);
  }

  protected readonly vista = signal<'galeria' | 'resenas'>('galeria');

  protected mostrar(evento: Event, vista: 'galeria' | 'resenas'): void {
    evento.preventDefault();
    this.vista.set(vista);
    // Esperamos a que Angular pinte la sección antes de hacer scroll
    setTimeout(() => {
      document.getElementById(vista)?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  protected irArriba(evento: Event): void {
    evento.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  
}