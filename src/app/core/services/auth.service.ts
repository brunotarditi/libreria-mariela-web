import { inject, Injectable, signal, computed } from "@angular/core";
import { environment } from "@environments/environment";
import { StorageService } from "@shared/services/storage.service";
import { ACCESS_TOKEN, ROLES } from "@core/constants/constants";
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

  // Reactive user payload and roles signals
  private userPayloadSignal = signal<Record<string, any> | null>(this.parsePayloadFromToken());
  readonly userPayload = this.userPayloadSignal.asReadonly();

  private rolesSignal = signal<string[]>(this.parseRolesFromToken());
  readonly roles = this.rolesSignal.asReadonly();
  readonly isRootSignal = computed(() => this.roles().includes(ROLES.OWNER));

  readonly userPicture = computed<string | null>(() => {
    const payload = this.userPayloadSignal();
    if (!payload) return null;
    return (payload['picture'] as string) || (payload['avatar'] as string) || (payload['image'] as string) || null;
  });

  readonly userName = computed<string>(() => {
    const payload = this.userPayloadSignal();
    if (!payload) return 'Usuario';
    return (payload['name'] as string) || (payload['username'] as string) || (payload['email'] as string) || 'Usuario';
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

  setToken(value: string, key: string): void {
    this.storageService.clear(key);
    this.storageService.set(key, value);
    if (key === ACCESS_TOKEN) {
      this.userPayloadSignal.set(this.parsePayloadFromToken());
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

  isOwner(): boolean {
    return this.roles().includes(ROLES.OWNER);
  }

  getRoles(): string[] {
    return this.roles();
  }

  refreshRoles(): void {
    this.userPayloadSignal.set(this.parsePayloadFromToken());
    this.rolesSignal.set(this.parseRolesFromToken());
  }

  private parsePayloadFromToken(): Record<string, any> | null {
    const token = this.storageService.get(ACCESS_TOKEN);
    if (!token || typeof token !== 'string') {
      return null;
    }
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadBase64Url = parts[1];
      const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payloadBase64));
    } catch {
      return null;
    }
  }

  private parseRolesFromToken(): string[] {
    const payload = this.parsePayloadFromToken();
    return payload && Array.isArray(payload['roles']) ? payload['roles'] : [];
  }

  clearLocalTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user');
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.clear();

    const savedMode = this.storageService.get('mode');
    this.storageService.clear(ACCESS_TOKEN);
    sessionStorage.clear();
    if (savedMode) {
      this.storageService.set('mode', savedMode);
    }

    this.userPayloadSignal.set(null);
    this.rolesSignal.set([]);
  }

  logOut(): void {
    // 1. Limpiar sesión y tokens locales
    this.clearLocalTokens();

    // 2. Obtener URL de logout federado de Peak Auth
    const logoutUrl = this.peakAuthClient.getLogoutUrl({
      redirectUri: `${window.location.origin}/auth/login`,
    });

    // 3. Redirigir la ventana a Peak Auth
    window.location.href = logoutUrl;
  }

  logout(): void {
    this.logOut();
  }
}
