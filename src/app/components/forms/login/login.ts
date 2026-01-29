import { Component, ViewEncapsulation} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router'; 

import { Router } from '@angular/router'; // importacion del Router
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';

// TO-DO importacion del servicio del login
import { LoginService } from '../../../services/loginService';
import { inject } from '@angular/core';

@Component({
  selector: 'app-login',
  encapsulation: ViewEncapsulation.None, 
  imports: [RouterLink, 
            RouterLinkActive,
            CommonModule,
            ReactiveFormsModule],
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
        this.formulario.reset(res);
        // Se guardan los datos en LocalStorage antes de navegar
        sessionStorage.setItem('user_session', JSON.stringify(res));
        // Si estamos seguros que el registro fue un correcto, ahi si cambiamos al siguiente componente...
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        alert('Error en el logeo');
      }
    });
  }
}
}