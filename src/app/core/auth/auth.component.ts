import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '@core/services/auth.service';
import { Login } from '@core/models/login';
import { StorageService } from '@shared/services/storage.service';
import { ACCESS_TOKEN, INFO } from '@core/constants/constants';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatToolbarModule
  ]
})
export class AuthComponent {

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);

  passwordVisibility: Record<string, WritableSignal<boolean>> = {
  login: signal(true),
  registerPass: signal(true),
  registerConfirmPass: signal(true),
};

  isLogin = signal(true);

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

  registerForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  })

  get firstName() {
    return this.registerForm.get('firstName') as FormControl;
  }

  get lastName() {
    return this.registerForm.get('lastName') as FormControl;
  }

  get email() {
    return this.registerForm.get('email') as FormControl;
  }

  get password() {
    return this.registerForm.get('password') as FormControl;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword') as FormControl;
  }


  onChangePasswordIcon(field: string, event: MouseEvent) {
  const current = this.passwordVisibility[field]
    if(current){
      current.set(!current())
    }
    event.stopPropagation();
  }

  signUp() {
    this.isLogin.set(!this.isLogin())
  }

  onSubmit() {
      const login: Login = {
        email: this.emailAuth.value,
        password: this.passwordAuth.value
      }
      this.authService.login(login).subscribe({
        next: (res) =>{
          this.authService.setToken(res.access_token, ACCESS_TOKEN)
          this.authService.setToken(res.info, INFO)
        },
        error: () => this.router.navigate(['/auth']),
        complete: () =>  this.router.navigate(['/dashboard'])

      })
    }

  goHome() {
    this.router.navigate(['/home']);
  }

}
