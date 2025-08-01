import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-verifyemail',
  templateUrl: './verifyemail.component.html',
  styleUrls: ['./verifyemail.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
  ]
})
export class VerifyEmailComponent implements OnInit {

  title: string = 'Verificación de email';
  token: string | null = null;
  message: string = 'Correo validado con éxito';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.token = params.get('token');
    });

    // if (this.isTokenFlow) {
    //   this.authService.verifyEmail(this.token).subscribe({
    //     next: () => this.message = '¡Email verificado con éxito!',
    //     error: () => this.message = 'El enlace ya expiró o no es válido.',
    //   });
    // }
  }

  get isTokenFlow() {
    return !!this.token;
  }

  goLogin(){
    this.router.navigate(['/auth/login'])
  }

}
