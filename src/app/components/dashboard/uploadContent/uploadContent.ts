import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../../services/uploadService';

@Component({
  selector: 'app-upload-content', 
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule], 
  templateUrl: './uploadContent.html', 
  styleUrl: '../../../app.css',
})
export class UploadContent {
  
  public uploadForm: FormGroup;
  public loading: boolean = false;
  
  // Variables para manejar la conversión a Base64
  private fileBase64: string = '';
  private fileName: string = '';

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);

  constructor() {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]], 
      file_type: ['audio', [Validators.required]],                
      description: ['', [Validators.maxLength(200)]],
      // Agregamos el control del archivo (aunque lo manejamos con evento change) para validación
      file: [null]           
    });
  }

  // Método para manejar la selección del archivo y convertirlo a Base64
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const tipoSeleccionado = this.uploadForm.get('file_type')?.value;

    if (file) {
        // 1. Validar tipo de archivo (Frontend check)
        const validaciones: { [key: string]: string[] } = {
            'audio': ['audio/mpeg', 'audio/mp3'],
            'score': ['application/pdf'],
            'lyric': ['text/plain']
        };

        const formatosPermitidos = validaciones[tipoSeleccionado] || [];
        
        // Nota: A veces el tipo MIME puede variar, esto es una validación básica
        // Si quieres ser permisivo, puedes quitar este if, pero ayuda a la UX.
        if (formatosPermitidos.length > 0 && !formatosPermitidos.includes(file.type) && file.type !== '') {
             alert(`Advertencia: El tipo de archivo parece no coincidir con ${tipoSeleccionado}.`);
        }

        this.fileName = file.name;

        // 2. Convertir a Base64 usando FileReader
        const reader = new FileReader();
        reader.onload = () => {
            // El resultado incluye "data:audio/mp3;base64,...", lo mandamos así, 
            // el backend (tu función guardarBase64) ya sabe limpiarlo.
            this.fileBase64 = reader.result as string;
        };
        reader.readAsDataURL(file);

    } else {
        this.fileBase64 = '';
        this.fileName = '';
    }
  }

  publicar(): void {
      // Verificamos que el formulario sea válido y que tengamos el string Base64 del archivo
      if (this.uploadForm.valid && this.fileBase64) {
          this.loading = true;
          
          // Recuperamos el ID del usuario de la sesión
          const sesion = JSON.parse(sessionStorage.getItem('user_session') || '{}');
          
          // Construimos el JSON Payload exacto que espera el nuevo PHP
          const payload = {
              user_id: sesion.user?.id, // Asegúrate de que tu objeto sesión tenga user.id
              title: this.uploadForm.value.title,
              description: this.uploadForm.value.description,
              file_type: this.uploadForm.value.file_type,
              file_name: this.fileName,
              file_data: this.fileBase64
          };

          this.uploadService.postPosts(payload).subscribe({
              next: (res: any) => {
                  alert("¡Publicación realizada con éxito!");
                  this.loading = false;
                  this.router.navigate(['/home']);
              },
              error: (err: any) => {
                  console.error(err);
                  alert("Error en la publicación. Verifica el tamaño del archivo.");
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