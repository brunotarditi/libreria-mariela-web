import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "@environments/environment";
import { StorageService } from "@shared/services/storage.service";
import { ACCESS_TOKEN, INFO } from "@core/constants/constants";
import { Register } from "@core/models/register";
import { Response } from "@shared/models/response";
import { PasswordReset } from "@core/models/passwordReset";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  roles: string[] = []
  private api = environment.api;
  private httpClient = inject(HttpClient);
  private storageService = inject(StorageService);

  register(register: Register): Observable<Response>{
    return this.httpClient.post<Response>(this.api + 'auth/register', register)
  }

  verifyEmail(token: string | null): Observable<Response>{
    return this.httpClient.get<Response>(this.api + `verify-email?token=${token}`)
  }


  sendResetPassword(email: string): Observable<Response>{
    return this.httpClient.get<Response>(this.api + `reset-password?email=${email}`)
  }

  resetPassword(passwordReset: PasswordReset): Observable<Response>{
    return this.httpClient.post<Response>(this.api + 'reset-password', passwordReset)
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

  isRoot(): boolean{
    return this.roles.indexOf('ROOT') > -1
  }


  getRoles(): void {
    const token = this.storageService.get(ACCESS_TOKEN);
    if (token) {
      try {
        const payloadBase64Url = token.split('.')[1];
        const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(payloadBase64));
        this.roles = payload.roles || [];
      } catch (e) {
        this.roles = [];
      }
    } else {
      this.roles = [];
    }
  }

  logOut(): void {
    this.storageService.clear(ACCESS_TOKEN)
    this.storageService.clear(INFO)
  }

}
