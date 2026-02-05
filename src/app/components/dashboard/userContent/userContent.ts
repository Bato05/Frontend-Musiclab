import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; // Importar RouterLinkActive
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GetPosts } from '../../../services/getPosts';
import { DeletePosts } from '../../../services/deletePosts';
import { PatchPost } from '../../../services/patchPosts';

@Component({
  selector: 'app-user-content',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule], // Añadir RouterLinkActive aquí
  templateUrl: './userContent.html',
  styleUrl: '../../../app.css',
})
export class UserContent implements OnInit {
  // --- Propiedades de Estado ---
  public posts: any[] = []; 
  public datosListos: boolean = false;
  public versionId: number = Date.now(); 
  
  // --- Propiedades de Edición ---
  public formEdicion: FormGroup;
  public editandoId: number | null = null;
  public selectedFile: File | null = null;

  // --- Inyección de Dependencias ---
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private postsService = inject(GetPosts);
  private deleteService = inject(DeletePosts);
  private patchService = inject(PatchPost);

  constructor() {
    this.formEdicion = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.maxLength(200)]],
      file_type: ['audio']
    });
  }

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
            this.versionId = Date.now(); 
            this.datosListos = true;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error("Error al cargar posts:", err);
            this.datosListos = true;
          }
        });
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  abrirEdicion(post: any) {
    this.editandoId = post.id;
    this.selectedFile = null; 
    this.formEdicion.patchValue({
      title: post.title,
      description: post.description,
      file_type: post.file_type
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async guardarCambios() {
    if (this.formEdicion.valid && this.editandoId) {
      const datosParaEnviar: any = { ...this.formEdicion.value };

      if (this.selectedFile) {
        datosParaEnviar.file_url = this.selectedFile.name;
        datosParaEnviar.file_data = await this.convertFileToBase64(this.selectedFile);
      }

      this.patchService.patchPost(this.editandoId, datosParaEnviar).subscribe({
        next: () => {
          alert("¡Publicación actualizada correctamente!");
          this.editandoId = null;
          this.selectedFile = null;
          this.cargarMisPublicaciones();
        },
        error: (err) => alert("Error al actualizar la publicación")
      });
    }
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.selectedFile = null;
    this.formEdicion.reset();
  }

  borrarPublicacion(id: number, titulo: string) {
    if (confirm(`¿Estás seguro de que quieres eliminar "${titulo}"?`)) {
      this.deleteService.deletePost(id).subscribe({
        next: () => {
          alert('Publicación eliminada correctamente.');
          this.cargarMisPublicaciones(); 
        },
        error: (err) => alert('No se pudo eliminar la publicación.')
      });
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}