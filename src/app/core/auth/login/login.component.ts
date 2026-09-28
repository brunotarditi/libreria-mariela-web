import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, MatCardModule, MatIconModule]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  loginWithPeakAuth(): void {
    this.authService.loginWithPeakAuth();
  }
}
