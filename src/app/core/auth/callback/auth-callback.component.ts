import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ACCESS_TOKEN } from '@core/constants/constants';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';

interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

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
      this.http.post<TokenResponse>(`${environment.api}auth/exchange`, { code }).subscribe({
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
