import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {
  private authService = inject(AuthService);

  get isLogged(): boolean {
    return this.authService.isLogged();
  }
}
