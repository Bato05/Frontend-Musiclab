import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { GetPosts } from '../../../services/getPosts';
import { DeletePosts } from '../../../services/deletePosts';
import { PatchPost } from '../../../services/patchPosts';
import { FollowService } from '../../../services/followService';

@Component({
  selector: 'app-user-content',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, 
            RouterLink, 
            RouterLinkActive, 
            ReactiveFormsModule],
  templateUrl: './userContent.html',
  styleUrl: '../../../app.css',
})
export class UserContent implements OnInit {
  public posts: any[] = [];
  public followedUsers: any[] = [];
  public datosListos: boolean = false;
  public editandoId: number | null = null;
  public selectedFile: File | null = null;
  public formEdicion: FormGroup;

  private fb = inject(FormBuilder);
  private postsService = inject(GetPosts);
  private patchService = inject(PatchPost);
  private deleteService = inject(DeletePosts);
  private followService = inject(FollowService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.formEdicion = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.maxLength(200)]],
      file_type: ['audio'],
      visibility: ['public', Validators.required],
      destination_id: [null] // Destinatario único
    });
  }

  ngOnInit(): void {
    this.cargarMisPublicaciones();
    this.cargarMisSeguidos();
  }

  cargarMisPublicaciones() {
    this.datosListos = false;
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    const userId = sesion.user?.id || sesion.id;

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.postsService.getUserPosts(userId).subscribe({
      next: (res: any) => {
        this.posts = Array.isArray(res) ? res : [];
        this.datosListos = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al cargar posts", err)
    });
  }

  cargarMisSeguidos() {
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    const miId = sesion.user?.id || sesion.id;
    if (miId) {
      this.followService.getFollowing(miId).subscribe({
        next: (res: any) => this.followedUsers = res.following || [],
        error: (err) => console.error("Error cargando seguidos", err)
      });
    }
  }

  abrirEdicion(post: any) {
    this.editandoId = post.id;
    this.selectedFile = null;
    this.formEdicion.patchValue({
      title: post.title,
      description: post.description,
      file_type: post.file_type,
      visibility: post.visibility || 'public',
      destination_id: post.destination_id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.selectedFile = null;
    this.formEdicion.reset({ visibility: 'public', file_type: 'audio' });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  guardarCambios() {
  if (this.formEdicion.invalid || !this.editandoId) return;

  const formVal = this.formEdicion.value;
  const payload: any = { 
    title: formVal.title,
    description: formVal.description,
    file_type: formVal.file_type,
    visibility: formVal.visibility,
    destination_id: formVal.destination_id
  };

  // Si hay un archivo, primero lo convertimos y en el callback enviamos
  if (this.selectedFile) {
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    
    reader.onload = () => {
      // Una vez cargado el archivo, preparamos el payload con la data
      payload.file_name = this.selectedFile?.name;
      payload.file_data = (reader.result as string).split(',')[1];
      
      // Enviamos la petición dentro del evento onload
      this.ejecutarPeticionPatch(payload);
    };
    
    reader.onerror = (error) => {
      console.error("Error al leer el archivo", error);
    };
  } else {
    // Si no hay archivo nuevo, enviamos directamente
    this.ejecutarPeticionPatch(payload);
  }
}

// Función auxiliar para no repetir código
private ejecutarPeticionPatch(payload: any) {
  this.patchService.patchPosts(this.editandoId!, payload).subscribe({
    next: (res: any) => {
      if (res.status === 'success') {
        alert("¡Publicación actualizada correctamente!");
        this.editandoId = null;
        this.selectedFile = null;
        this.cargarMisPublicaciones();
        
        // Forzamos la detección de cambios para que la lista se refresque
        this.cdr.detectChanges();
      }
    },
    error: (err) => {
      console.error("Error al actualizar", err);
      alert("No se pudo actualizar la publicación");
    }
  });
}

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  borrarPublicacion(id: number, titulo: string) {
    if (confirm(`¿Eliminar "${titulo}"?`)) {
      this.deleteService.deletePost(id).subscribe(() => this.cargarMisPublicaciones());
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}