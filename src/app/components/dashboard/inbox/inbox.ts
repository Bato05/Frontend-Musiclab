import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GetPosts } from '../../../services/getPosts';

@Component({
  selector: 'app-inbox',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterLink],
  templateUrl: './inbox.html',
  styleUrl: '../../../app.css'
})
export class Inbox implements OnInit {
  public receivedPosts: any[] = [];
  public loading: boolean = true;
  
  private postsService = inject(GetPosts);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // Inyección del detector

  ngOnInit(): void {
    this.cargarMensajesRecibidos();
  }

  cargarMensajesRecibidos() {
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    const miId = sesion.user?.id || sesion.id;

    if (miId) {
      this.postsService.getPosts().subscribe({
        next: (res: any) => {
          // Filtro: Visibilidad 'followers' y que el destinatario sea yo (miId)
          this.receivedPosts = res.filter((post: any) => 
            post.visibility === 'followers' && parseInt(post.destination_id) === parseInt(miId)
          );
          
          this.loading = false;
          this.cdr.detectChanges(); // Forzamos la actualización de la vista
        },
        error: (err: any) => {
          console.error("Error al cargar posts del inbox", err);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  // Método necesario para el botón de descarga de la tarjeta
  ejecutarDescarga(post: any): void {
    const urlBase = 'http://localhost/phpMusicLab/uploads/';
    const urlCompleta = urlBase + post.file_url;
    window.open(urlCompleta, '_blank');
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}