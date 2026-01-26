import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { Router } from '@angular/router'; // importacion del Router
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

  private router = inject(Router); // necesario para el cambiar a la interfaz del logeo
  
  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      id: [null, []],
      first_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ñÑ]+$/u)]],
      last_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ñÑ]+$/u)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user'], 
      artist_type: [[], [Validators.required]], 
      bio: ['', [Validators.maxLength(500)]],
      profile_img_url: ['default_profile.png'],
      status: [1], 
      created_at: [new Date().toISOString()]
    }, {
      // aplicamos el validaor de contrasenias a nivel de grupo (formulario)
      validators: this.passwordsMatch
    });
  }

registrarse() {
  if (this.formulario.valid) {
    this.registerService.postUser(this.formulario.value).subscribe({
      next: (res: any) => {
        alert('¡Usuario creado correctamente!');
        this.formulario.reset(res);
        // Si estamos seguros que el registro fue un correcto, ahi si cambiamos al logeo
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        alert('Error en el registro');
      }
    });
  }
}

passwordsMatch(form: FormGroup) {
  const password = form.get('password') ?.value;
  const confirm_password = form.get('confirm_password') ?.value;
  
  return password === confirm_password ? null : { notMatching: true };
}
}