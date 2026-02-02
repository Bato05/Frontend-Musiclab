import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetPosts {
  private http = inject(HttpClient);
  
  private baseUrl = 'http://localhost/phpMusicLab/api/index.php';

  // Traer todos (Home)
  getPosts(): Observable<any> {
    return this.http.get(`${this.baseUrl}?accion=posts`);
  }

  // Traer propios (My Content)
  getUserPosts(userId: number | string): Observable<any> {
    return this.http.get(`${this.baseUrl}?accion=posts/${userId}`);
  }

  // Borrar publicación (Misma estructura, solo agregamos la "llave" del token)
  deletePost(postId: number | string): Observable<any> {
    // Asegúrate de obtener el token correcto del almacenamiento
    // Nota: En login.ts guardaste la respuesta completa como 'user_session'
    const sesionRaw = sessionStorage.getItem('user_session');
    const sesion = sesionRaw ? JSON.parse(sesionRaw) : null;
    const token = sesion?.token; // Extrae el token del objeto de sesión

    // El prefijo DEBE SER "Bearer " (con 'e' y un espacio al final)
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}?accion=posts/${postId}`, { headers });
  }
}