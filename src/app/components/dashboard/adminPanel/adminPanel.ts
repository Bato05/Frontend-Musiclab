import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule,
            RouterLink],
  templateUrl: './adminPanel.html',
  styleUrl: '../../../app.css'
})
export class AdminPanel implements OnInit{

  userRole: number = 0;

  private router = inject(Router);

  ngOnInit(): void {
    const sesion = JSON.parse(localStorage.getItem('user_session') || '{}');
    
    // 2. Extracción SEGURA del rol
    // Intenta leer 'sesion.user.role'. Si no existe, usa '0' para evitar NaN.
    const rawRole = sesion.user?.role || sesion.role || 0;

    // 3. Asignación y conversión
    this.userRole = Number(rawRole);
  }

  logout(): void {
    localStorage.clear(); 
    this.router.navigate(['/login']);
  }
}
