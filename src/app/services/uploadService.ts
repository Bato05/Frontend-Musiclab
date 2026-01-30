import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost/phpMusicLab/api/index.php?accion=posts';

  postPosts(datosFormulario: any, archivo: File | null): Observable<any> {
    const fd = new FormData();
    
    // Obtenemos el ID del autor de la sesión actual
    const sesion = JSON.parse(sessionStorage.getItem('user_session') || '{}');
    const userId = sesion.user?.id;

    fd.append('user_id', userId);
    fd.append('title', datosFormulario.title);
    fd.append('description', datosFormulario.description);
    fd.append('file_type', datosFormulario.file_type);

    // Solo adjuntamos la materia física si el usuario decidió subirla
    if (archivo) {
      fd.append('file', archivo);
    }

    return this.http.post(this.apiUrl, fd);
  }
}
