import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '@core/services/auth.service';
import { Login } from '@core/models/login';
import { ACCESS_TOKEN, INFO } from '@core/constants/constants';
import { SnackBarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
  ]
})
export class LoginComponent {

  title: string = 'Iniciar sesión';

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBarService = inject(SnackBarService);

  passwordVisibility: Record<string, WritableSignal<boolean>> = {
    login: signal(true),
  };

  authForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get emailAuth() {
    return this.authForm.get('email') as FormControl;
  }

  get passwordAuth() {
    return this.authForm.get('password') as FormControl;
  }


  onChangePasswordIcon(field: string, event: MouseEvent) {
    const current = this.passwordVisibility[field]
      if(current){
        current.set(!current())
      }
    event.stopPropagation();
  }

  onLogin() {
    const login: Login = {
      email: this.emailAuth.value,
      password: this.passwordAuth.value
    }
    this.authService.login(login).subscribe({
      next: (res) => {
        this.authService.setToken(res.access_token, ACCESS_TOKEN)
        this.authService.setToken(res.info, INFO)
      },
      error: (err) => {
        this.snackBarService.showSnackBar(`${err.error.error}`, 'error-snackbar', 3000, 'end', 'top')
        this.router.navigate(['/auth'])
      },
      complete: () =>  this.router.navigate(['/dashboard'])

    })
  }

  goPasswordReset(){
    this.router.navigate(['/auth/reset-password'])
  }

  goRegister(){
    this.router.navigate(['/auth/register'])
  }

}
