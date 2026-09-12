import { inject, Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import { StorageService } from "@shared/services/storage.service";
import { ACCESS_TOKEN } from "@core/constants/constants";
import { PeakAuthClient } from "@brunotarditi/peak-auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  roles: string[] = []
  private storageService = inject(StorageService);
  private peakAuthClient = new PeakAuthClient({
    issuerUrl: environment.peakAuthUrl,
    clientId: environment.peakAuthClientId,
  });

  async loginWithPeakAuth(): Promise<void> {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const pkce = await this.peakAuthClient.generatePKCE();
    sessionStorage.setItem('oauth_code_verifier', pkce.codeVerifier);

    const loginUrl = this.peakAuthClient.getAuthorizationUrl({
      redirectUri,
      state,
      codeChallenge: pkce.codeChallenge,
    });

    window.location.href = loginUrl;
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
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/login`);
    window.location.href = `${environment.peakAuthUrl}/oauth/logout?redirect_uri=${redirectUri}`;
  }

}
