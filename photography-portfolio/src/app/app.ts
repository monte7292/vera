import { Component } from '@angular/core';
import { PhotoGallery } from './photo-gallery/photo-gallery';

@Component({
  selector: 'app-root',
  imports: [PhotoGallery],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
