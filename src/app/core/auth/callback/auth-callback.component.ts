import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ACCESS_TOKEN } from '@core/constants/constants';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { TokenResponse } from '@core/models/login';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  standalone: true
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const savedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');

    if (code && state && savedState && state === savedState) {
      const code_verifier = sessionStorage.getItem('oauth_code_verifier');
      const redirect_uri = `${window.location.origin}/auth/callback`;
      sessionStorage.removeItem('oauth_code_verifier');

      this.http.post<TokenResponse>(`${environment.api}auth/exchange`, { code, code_verifier, redirect_uri }).subscribe({
        next: (res: TokenResponse) => {
          this.authService.setToken(res.access_token, ACCESS_TOKEN);
          this.router.navigate(['/dashboard']);
        },
        error: () => this.router.navigate(['/auth/login'])
      });
      return;
    }
    this.router.navigate(['/auth/login']);
  }
}
