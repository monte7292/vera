import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({ selector: '[revelar]' })
export class Revelar implements OnInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const elemento = this.el.nativeElement;
    this.observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          elemento.classList.add('revelado');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    this.observer.observe(elemento);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}