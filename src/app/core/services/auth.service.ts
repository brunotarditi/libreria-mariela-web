import { inject, Injectable, signal, computed } from "@angular/core";
import { environment } from "@environments/environment";
import { StorageService } from "@shared/services/storage.service";
import { ACCESS_TOKEN } from "@core/constants/constants";
import { PeakAuthClient } from "@brunotarditi/peak-auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private storageService = inject(StorageService);
  private peakAuthClient = new PeakAuthClient({
    issuerUrl: environment.peakAuthUrl,
    clientId: environment.peakAuthClientId,
  });

  // Reactive roles signal
  private rolesSignal = signal<string[]>(this.parseRolesFromToken());
  readonly roles = this.rolesSignal.asReadonly();
  readonly isRootSignal = computed(() => this.roles().includes('ROOT'));

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

  setToken(value: string, key: string): void {
    this.storageService.clear(key);
    this.storageService.set(key, value);
    if (key === ACCESS_TOKEN) {
      this.rolesSignal.set(this.parseRolesFromToken());
    }
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    const currentRoles = this.roles();
    return requiredRoles.some(role => currentRoles.includes(role));
  }

  isLogged(): boolean {
    return !!this.storageService.get(ACCESS_TOKEN);
  }

  isRoot(): boolean {
    return this.roles().includes('ROOT');
  }

  getRoles(): string[] {
    return this.roles();
  }

  refreshRoles(): void {
    this.rolesSignal.set(this.parseRolesFromToken());
  }

  private parseRolesFromToken(): string[] {
    const token = this.storageService.get(ACCESS_TOKEN);
    if (!token || typeof token !== 'string') {
      return [];
    }
    try {
      const parts = token.split('.');
      if (parts.length < 2) return [];
      const payloadBase64Url = parts[1];
      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(payloadBase64));
      return Array.isArray(payload.roles) ? payload.roles : [];
    } catch {
      return [];
    }
  }

  logOut(): void {
    this.storageService.clear(ACCESS_TOKEN);
    this.rolesSignal.set([]);
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/login`);
    window.location.href = `${environment.peakAuthUrl}/oauth/logout?redirect_uri=${redirectUri}`;
  }

}
