import { Component } from '@angular/core';
import { ContactForm } from './contact-form/contact-form';
import { PhotoGallery } from './photo-gallery/photo-gallery';

@Component({
  selector: 'app-root',
  imports: [ContactForm, PhotoGallery],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
