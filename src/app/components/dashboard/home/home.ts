// app/components/dashboard/home/home.ts
import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { GetPosts } from '../../../services/getPosts';
import { Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-home',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, 
            RouterLink], 
  templateUrl: './home.html',
  styleUrl: '../../../app.css',
})
export class Home implements OnInit {
  public posts: any[] = []; 
  private getPostsService = inject(GetPosts);
  private cdr = inject(ChangeDetectorRef); // Inyecta el detector
  private router = inject(Router);

  ngOnInit(): void {
    this.getPostsService.getPosts().subscribe({
    next: (res) => {
      this.posts = res; 
      this.cdr.detectChanges(); // Aseguramos que la lista se refleje en la vista
      console.log("Las publicaciones cargaron con éxito.");
    },
    error: (err) => console.error("Error en la carga:", err)
  });
  }

  logout(): void {
    // Limpiamos la sesión (localStorage, sessionStorage o Cookies)
    localStorage.clear(); 
    sessionStorage.clear();

    // Redireccionamos al login
    this.router.navigate(['/login']);
  }

  // En app/components/dashboard/home/home.ts

  ejecutarDescarga(post: any): void {
    // Construimos la ruta directa a la materia física en XAMPP
    const urlBase = 'http://localhost/phpMusicLab/uploads/';
    const urlCompleta = urlBase + post.file_url;

    console.log(`Abriendo recurso para descarga: ${post.title}`);

    // Usamos la forma más directa y compatible: 
    // Abre el archivo en una pestaña nueva, protegiendo tu sesión actual.
    window.open(urlCompleta, '_blank');
  }
}