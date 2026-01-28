import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { GetPosts } from '../../../services/getPosts';

@Component({
  selector: 'app-home',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: '../../../app.css',
})
export class Home implements OnInit {
  public posts: any[] = []; 
  private getPostsService = inject(GetPosts);
  private cdr = inject(ChangeDetectorRef); // Inyecta el detector

  ngOnInit(): void {
    this.getPostsService.getPosts().subscribe({
      next: (res) => {
        this.posts = res; 
        this.cdr.detectChanges(); // <--- Fuerza el renderizado inmediato
        console.log("Datos cargados automáticamente:", this.posts);
      },
      error: (err) => console.error("Error en la carga:", err)
    });
  }
}