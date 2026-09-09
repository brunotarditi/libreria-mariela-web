import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [MatButtonModule, MatCardModule]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);

  loginWithPeakAuth(): void {
    this.authService.loginWithPeakAuth();
  }
}
