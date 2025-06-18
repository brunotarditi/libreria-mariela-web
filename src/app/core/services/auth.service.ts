import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Login } from "@core/models/login";
import { Tokens } from "@core/models/token";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { StorageService } from "@shared/services/storage.service";
import { ACCESS_TOKEN, INFO } from "@core/constants/constants";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  roles: string[] = []
  private api = environment.api;
  private httpClient = inject(HttpClient);
  private storageService = inject(StorageService);

  login(login: Login): Observable<Tokens>{
    return this.httpClient.post<Tokens>(this.api + 'users/login', login)
  }

  setToken(value: string, key: string) {
    this.storageService.clear(key)
    this.storageService.set(key, value);
  }


  hasAnyRole(requiredRoles: string[]): boolean {
    return requiredRoles.some(role => this.roles.includes(role));
  }

  isLogged(): boolean {
    if (this.storageService.get(ACCESS_TOKEN)) {
        return true;
    } else {
        return false;
    }
  }


  getRoles(): void {
    const token = this.storageService.get(INFO);
    if (token) {
      const info = atob(token);
      const values = JSON.parse(info);
      this.roles = values;
    }
  }

  logOut(): void {
    this.storageService.clear(ACCESS_TOKEN)
    this.storageService.clear(INFO)
  }

}
