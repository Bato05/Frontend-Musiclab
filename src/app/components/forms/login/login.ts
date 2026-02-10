import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 
import { Router } from '@angular/router'; 
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

import { LoginService } from '../../../services/loginService';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  encapsulation: ViewEncapsulation.None, 
  imports: [
    RouterLink, 
    RouterLinkActive,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: '../../../app.css',
})
export class Login {
  public formulario: FormGroup;

  private router = inject(Router);
  private loginService = inject(LoginService);

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  logearse() {
    if (this.formulario.valid) {
      this.loginService.postLogin(this.formulario.value).subscribe({
        next: (res: any) => {
          
          // --- VALIDACIÓN DE STATUS (BLOQUEO) ---
          
          // 1. Obtenemos el objeto usuario. Dependiendo de tu API PHP, 
          // a veces viene en 'res.user' o a veces 'res' es el usuario directo.
          // Usamos esta lógica para asegurarnos de atraparlo.
          const usuario = res.user || res; 

          // 2. Verificamos el atributo 'status' de la tabla users (tinyint)
          // Si status es 0, significa que está bloqueado.
          if (usuario.status !== undefined && Number(usuario.status) === 0) {
            alert('⛔ CUENTA SUSPENDIDA\n\nTu usuario ha sido bloqueado por un administrador.\nNo tienes permiso para acceder.');
            return; // <--- DETENEMOS AQUÍ. No se guarda sesión ni se redirige.
          }

          // --------------------------------------

          // Si el status es 1 (o no existe bloqueo), procedemos normal:
          this.formulario.reset();
          localStorage.setItem('user_session', JSON.stringify(res));
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          console.error(err);
          alert('Error: Credenciales incorrectas o problema de conexión.');
        }
      });
    }
  }
}