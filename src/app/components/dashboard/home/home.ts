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
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  ngOnInit(): void {
    this.getPostsService.getPosts().subscribe({
      next: (res) => {
        // FILTRO: Solo guardamos las publicaciones cuya visibilidad sea 'public'
        this.posts = res.filter((p: any) => p.visibility === 'public');
        this.cdr.detectChanges(); // Fuerza la actualización de la vista
      },
      error: (err) => console.error("Error en la carga:", err)
    });
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }

  ejecutarDescarga(post: any): void {
    // URL directa al archivo físico en XAMPP
    const urlBase = 'http://localhost/phpMusicLab/uploads/';
    const urlCompleta = urlBase + post.file_url;

    console.log(`Abriendo recurso: ${post.title} -> ${urlCompleta}`);

    // Usamos window.open para "navegar" al archivo. 
    // Esto hace que el navegador decida si reproducirlo o bajarlo, evitando bloqueos CORS.
    window.open(urlCompleta, '_blank');
  }
}