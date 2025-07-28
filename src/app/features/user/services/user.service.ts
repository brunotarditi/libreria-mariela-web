import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { User } from '../model/user';
import { Observable } from 'rxjs';
import { Response } from '@shared/models/response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getAll(): Observable<User[]>{
    return this.httpClient.get<User[]>(this.api + 'users')
  }

  patch(id:number, is_active: boolean): Observable<User>{
    return this.httpClient.patch<User>(this.api + 'users/' + id, { is_active: is_active })
  }

  assignRol(id: number, role: string): Observable<Response>{
    return this.httpClient.post<Response>(this.api + 'roles/' + id + '/assign', {role: role})
  }

}
