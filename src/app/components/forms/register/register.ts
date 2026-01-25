import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

import { RegisterService } from '../../../services/registerService';
import { inject } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  public formulario: FormGroup;

  private registerService = inject(RegisterService);// fundamental injectar el httpclient si no, no funciona
  
  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      id: [null, []],
      first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ñÑ]+$/u)]],
      last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ñÑ]+$/u)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user'], 
      artist_type: [[], [Validators.required]], 
      bio: ['', [Validators.maxLength(500)]],
      profile_img_url: ['default_profile.png'],
      status: [1], 
      created_at: [new Date().toISOString()]
    });
  }

registrarse() {
  if (this.formulario.valid) {
    this.registerService.postUser(this.formulario.value).subscribe({
      next: (res: any) => console.log('¡Usuario creado!', res),
      error: (err: any) => console.error('Error en el registro', err)
    });
  }
}
}