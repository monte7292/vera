import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  imports: [FormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css'
})
export class ContactForm {
  protected readonly enviado = signal(false);

  protected enviar(formulario: NgForm): void {
    if (formulario.invalid) {
      return;
    }

    this.enviado.set(true);
    formulario.resetForm();
  }
}
