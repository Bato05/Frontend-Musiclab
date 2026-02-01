import { Component, ViewEncapsulation } from '@angular/core';

import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-content',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule,
            RouterLink],
  templateUrl: './userContent.html',
  styleUrl: '../../../app.css',
})
export class UserContent {
  public posts: any[] = []; 
  private router = inject(Router);

  logout(): void {
    localStorage.clear(); 
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
