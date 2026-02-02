import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GetPosts } from '../../../services/getPosts';

@Component({
  selector: 'app-user-content',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterLink],
  templateUrl: './userContent.html',
  styleUrl: '../../../app.css',
})
export class UserContent implements OnInit {
  public posts: any[] = []; 
  public datosListos: boolean = false;
  public versionId: number = Date.now(); // Propiedad estática para evitar el error NG0100
  
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private postsService = inject(GetPosts);

  ngOnInit(): void {
    this.cargarMisPublicaciones();
  }

  cargarMisPublicaciones() {
    this.datosListos = false;
    const sesionRaw = sessionStorage.getItem('user_session');
    
    if (sesionRaw) {
      const sesion = JSON.parse(sesionRaw);
      const userId = sesion.user?.id || sesion.id;

      if (userId) {
        this.postsService.getUserPosts(userId).subscribe({
          next: (res: any) => {
            this.posts = Array.isArray(res) ? res : [];
            this.versionId = Date.now(); // Se actualiza solo al recibir datos nuevos
            this.datosListos = true;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Error al cargar posts:", err);
            this.datosListos = true;
            this.posts = [];
          }
        });
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  borrarPublicacion(id: number, titulo: string) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${titulo}"?`)) {
      this.postsService.deletePost(id).subscribe({
        next: () => {
          alert('Publicación eliminada.');
          this.cargarMisPublicaciones(); 
        },
        error: (err) => {
          console.error("Error al borrar:", err);
          alert('No se pudo eliminar la publicación.');
        }
      });
    }
  }

  logout(): void {
    sessionStorage.clear();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}