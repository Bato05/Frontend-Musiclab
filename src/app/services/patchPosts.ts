import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatchPost {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost/phpMusicLab/api/index.php';

  // Edita una publicación existente
  patchPost(postId: number | string, datos: any): Observable<any> {
    const sesionRaw = sessionStorage.getItem('user_session');
    const sesion = sesionRaw ? JSON.parse(sesionRaw) : null;
    const token = sesion?.token;

    // Se asegura el prefijo "Bearer " para que PHP valide correctamente
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.patch(`${this.baseUrl}?accion=posts/${postId}`, datos, { headers });
  }
}