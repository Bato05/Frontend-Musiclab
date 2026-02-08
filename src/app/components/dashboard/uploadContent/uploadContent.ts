import { Component, inject, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router'; 
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../../services/uploadService';
import { FollowService } from '../../../services/followService'; // Cambiado por FollowService

@Component({
  selector: 'app-upload-content', 
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, 
            RouterLink, 
            ReactiveFormsModule], 
  templateUrl: './uploadContent.html', 
  styleUrl: '../../../app.css',
})
export class UploadContent implements OnInit {
  
  public uploadForm: FormGroup;
  public usersList: any[] = []; // Ahora contendrá solo a los usuarios que sigues
  public loading: boolean = false;
  
  // Variables para manejar la conversión a Base64
  private fileBase64: string = '';
  public fileName: string = ''; 

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);
  private followService = inject(FollowService); // Inyectamos el servicio de seguimiento

  constructor() {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]], 
      file_type: ['audio', [Validators.required]],                
      description: ['', [Validators.maxLength(200)]],
      visibility: ['public', Validators.required], 
      destination_id: [null] 
    });
  }

  ngOnInit() {
    this.cargarSeguidos();
  }

  cargarSeguidos() {
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    const miId = sesion.user?.id;

    if (miId) {
      // Obtenemos solo los usuarios que el usuario actual sigue
      this.followService.getFollowing(miId).subscribe({
        next: (res: any) => {
          // Según tu API, la lista viene dentro de la propiedad 'following'
          this.usersList = res.following || [];
        },
        error: (err) => console.error("Error al obtener seguidos", err)
      });
    }
  }

  // Maneja la selección del archivo y convierte a Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      
      reader.onload = () => {
        this.fileBase64 = reader.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  }

  // Publicar contenido
  publicar(): void {
    if (this.uploadForm.valid && this.fileBase64) {
      const val = this.uploadForm.value;

      // Validación: si es followers, el destino es obligatorio
      if (val.visibility === 'followers' && !val.destination_id) {
        alert("Debes seleccionar a un seguido de la lista para esta visibilidad.");
        return;
      }

      this.loading = true;
      const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
      
      const payload = {
        user_id: sesion.user?.id, 
        title: val.title,
        description: val.description,
        file_type: val.file_type,
        file_name: this.fileName,
        file_data: this.fileBase64,
        visibility: val.visibility,
        destination_id: val.destination_id
      };

      this.uploadService.postPosts(payload).subscribe({
        next: (res: any) => {
          alert("¡Publicación realizada con éxito!");
          this.loading = false;
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          console.error(err);
          alert("Error en la publicación. Revisa el tamaño del archivo.");
          this.loading = false;
        }
      });
    } else {
      alert("Por favor completa todos los campos y selecciona un archivo.");
    }
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}