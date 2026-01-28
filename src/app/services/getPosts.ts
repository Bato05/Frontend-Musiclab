import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetPosts {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost/phpMusicLab/api/index.php?accion=posts';

  getPosts(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}