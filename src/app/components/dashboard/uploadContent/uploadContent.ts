import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink } from '@angular/router'; 
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '../../../services/uploadService';

@Component({
  selector: 'app-upload-content', 
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  // Agregamos ReactiveFormsModule a los imports
  imports: [CommonModule, RouterLink, ReactiveFormsModule], 
  templateUrl: './uploadContent.html', 
  styleUrl: '../../../app.css',
})
export class UploadContent {
  private router = inject(Router);

  public formulario: FormGroup;

  private uploadService = inject(UploadService);

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]], 
      file_type: ['audio', [Validators.required]],                
      description: ['', [Validators.maxLength(200)]]            
    });
  }

  logout(): void {
    localStorage.clear(); 
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  public selectedFile: File | null = null;

  onFileSelected(event: any): void {
      this.selectedFile = event.target.files[0];
  }

  publicar(): void {
      if (this.formulario.valid) {
          // Usamos el servicio pasando el formulario Y el archivo (aunque sea null)
          this.uploadService.postPosts(this.formulario.value, this.selectedFile).subscribe({
              next: (res: any) => {
                  alert("¡Publicación realizada con éxito!");
                  this.formulario.reset();
                  this.selectedFile = null;
              },
              error: (err: any) => alert("Error en la publicación")
          });
      }
  }
}