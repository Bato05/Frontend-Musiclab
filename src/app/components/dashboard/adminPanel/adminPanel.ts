import { Component, OnInit, ViewEncapsulation, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

// Servicios de Usuarios
import { GetUsers } from '../../../services/getUsers';
import { PatchUsers } from '../../../services/patchUsers';
import { DeleteUsers } from '../../../services/deleteUsers';

// Servicios de Posts
import { GetPosts } from '../../../services/getPosts';
import { DeletePosts } from '../../../services/deletePosts';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './adminPanel.html',
  styleUrls: ['../../../app.css']
})
export class AdminPanel implements OnInit {

  userRole: number = 0;
  myId: number = 0;
  usersList: any[] = [];
  loading: boolean = false;

  // Variables para Modales
  modalEdicionAbierto: boolean = false;
  modalPostsAbierto: boolean = false;
  
  // Datos temporales
  usuarioSeleccionado: any = {};
  nuevaPassword: string = '';

  // --- NUEVO: Variables para manejo de imagen ---
  newImgBase64: string = '';
  newImgName: string = '';
  previewUrl: string | null = null;
  // ---------------------------------------------
  
  // Posts del usuario
  listaPostsUsuario: any[] = [];
  cargandoPosts: boolean = false;

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  // Inyección de Servicios
  private getUsersService = inject(GetUsers);
  private patchUsersService = inject(PatchUsers);
  private deleteUsersService = inject(DeleteUsers);
  private getPostsService = inject(GetPosts);
  private deletePostsService = inject(DeletePosts);

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    const rawRole = sesion.user?.role || sesion.role || 0;
    this.userRole = Number(rawRole);
    this.myId = Number(sesion.user?.id || sesion.id || 0);

    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.getUsersService.getUsers().subscribe({
      next: (res: any) => {
        if (this.userRole === 1) {
            this.usersList = res.filter((u: any) => Number(u.role) === 0);
        } else if (this.userRole === 2) {
            this.usersList = res.filter((u: any) => Number(u.role) < 2 && Number(u.id) !== this.myId);
        } else {
            this.usersList = [];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error cargando usuarios:", err);
        this.loading = false;
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'http://localhost/phpMusicLab/assets/default_profile.png';
  }

  // ==========================================
  // LÓGICA DEL MODAL DE EDICIÓN (PatchUsers)
  // ==========================================
  
  abrirModalEdicion(user: any) {
    this.usuarioSeleccionado = { ...user }; // Copia para no alterar la tabla
    this.nuevaPassword = '';
    
    // --- NUEVO: Resetear imagen al abrir modal ---
    this.newImgBase64 = '';
    this.newImgName = '';
    this.previewUrl = null;
    // ---------------------------------------------

    this.modalEdicionAbierto = true;
  }

  // --- NUEVO: Función para seleccionar archivo ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }

      this.newImgName = file.name;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.newImgBase64 = reader.result as string;
        this.previewUrl = this.newImgBase64; // Actualizar vista previa
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }
  // -----------------------------------------------

  guardarCambiosUsuario() {
    if (!confirm(`¿Confirmar cambios para ${this.usuarioSeleccionado.first_name}?`)) return;

    const datosActualizar: any = {
        first_name: this.usuarioSeleccionado.first_name,
        last_name: this.usuarioSeleccionado.last_name,
        email: this.usuarioSeleccionado.email,
        bio: this.usuarioSeleccionado.bio,
        artist_type: this.usuarioSeleccionado.artist_type
    };

    if (this.nuevaPassword && this.nuevaPassword.trim() !== '') {
        datosActualizar.password = this.nuevaPassword;
    }

    // --- NUEVO: Agregar imagen al payload si existe ---
    if (this.newImgBase64) {
        datosActualizar.profile_img_data = this.newImgBase64;
        datosActualizar.profile_img_name = this.newImgName;
    }
    // --------------------------------------------------

    // Llamada al servicio: ID primero, DATOS después
    this.patchUsersService.patchUsers(this.usuarioSeleccionado.id, datosActualizar).subscribe({
        next: (res) => {
            alert('Usuario actualizado correctamente.');
            this.cerrarModales();
            this.cargarUsuarios(); // Recargar tabla para ver cambios
        },
        error: (err) => alert('Error al actualizar usuario.')
    });
  }

  // ==========================================
  // LÓGICA DEL MODAL DE POSTS
  // ==========================================

  abrirModalPosts(user: any) {
    this.usuarioSeleccionado = user;
    this.modalPostsAbierto = true;
    this.cargandoPosts = true;
    this.listaPostsUsuario = [];

    this.getPostsService.getUserPosts(user.id).subscribe({
        next: (res: any) => {
            this.listaPostsUsuario = Array.isArray(res) ? res : []; 
            this.cargandoPosts = false;
        },
        error: (err) => {
            console.error(err);
            this.cargandoPosts = false;
        }
    });
  }

  eliminarPost(post: any) {
    if(confirm(`¿Eliminar la publicación "${post.title}"?`)) {
        this.deletePostsService.deletePost(post.id).subscribe({
            next: () => {
                this.listaPostsUsuario = this.listaPostsUsuario.filter(p => p.id !== post.id);
            },
            error: () => alert('Error al eliminar publicación.')
        });
    }
  }

  cerrarModales() {
    this.modalEdicionAbierto = false;
    this.modalPostsAbierto = false;
    this.usuarioSeleccionado = {};
    
    // Limpiar imagen también
    this.newImgBase64 = '';
    this.previewUrl = null;
  }

  // ==========================================
  // ACCIONES PRINCIPALES
  // ==========================================

  toggleBlockUser(user: any) {
    const nuevoStatus = user.status == 1 ? 0 : 1;
    const accionTexto = nuevoStatus == 0 ? "bloquear" : "activar";

    if (confirm(`¿Estás seguro de que deseas ${accionTexto} a ${user.first_name}?`)) {
        this.patchUsersService.patchUsers(user.id, { status: nuevoStatus }).subscribe({
            next: () => this.cargarUsuarios(),
            error: () => alert("Error al actualizar estado.")
        });
    }
  }

  deleteUser(user: any) {
      if (confirm(`PELIGRO: ¿Eliminar definitivamente a ${user.first_name}?`)) {
          this.deleteUsersService.deleteUser(user.id).subscribe({
              next: () => this.cargarUsuarios(),
              error: () => alert("Error al eliminar usuario.")
          });
      }
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}