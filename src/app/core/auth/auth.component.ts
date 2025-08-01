import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class AuthComponent {

  private router = inject(Router);

  goHome() {
    this.router.navigate(['/home']);
  }

}
