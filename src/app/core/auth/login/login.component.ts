import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, MatCardModule]
})
export class LoginComponent {
  private readonly authUrl = environment.peakAuthUrl;
  private readonly clientId = environment.peakAuthClientId;

  loginWithPeakAuth(): void {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    const loginUrl = `${this.authUrl}/oauth/authorize?client_id=${encodeURIComponent(this.clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${encodeURIComponent(state)}`;

    window.location.href = loginUrl;
  }
}
