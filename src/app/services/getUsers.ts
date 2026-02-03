import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetUsers {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost/phpMusicLab/api/index.php?accion=users';

  // al ser una peticion get no debe obtener datos de ningun formulario
  getUsers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}