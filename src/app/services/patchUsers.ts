import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatchUsers {
  private http = inject(HttpClient);
  // Ajusta la ruta si es diferente en tu proyecto
  private url = 'http://localhost/phpMusicLab/api/index.php?accion=users';

  constructor() { }

  patchUsers(userData: any, id: number | string): Observable<any> {
    // Obtenemos el token para la autorización
    const sesion = JSON.parse(sessionStorage.getItem('user_session') || '{}');
    const token = sesion.token;

    // Angular envía JSON por defecto, así que solo pasamos el objeto 'userData'
    // No usamos FormData ni headers raros, solo el token.
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // Usamos el método PATCH real HTTP
    return this.http.patch(`${this.url}/${id}`, userData, { headers });
  }
}