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
import { SnackBarService } from '@shared/services/snackbar.service';
import { Register } from '@core/models/register';
import { PasswordValidator } from '@shared/utils/password.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
export class RegisterComponent {

  title: string = 'Registrarse';

  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBarService = inject(SnackBarService);

  passwordVisibility: Record<string, WritableSignal<boolean>> = {
    registerPass: signal(true),
    registerConfirmPass: signal(true),
  };

  registerForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  },
    { validators: PasswordValidator.passwordsMatchValidator('password', 'confirmPassword') }
  )

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

  onRegister(){
      const register: Register = {
        username: this.email.value.split('@')[0],
        email: this.email.value,
        password: this.password.value,
        first_name: this.firstName.value,
        last_name: this.lastName.value
      }
      this.authService.register(register).subscribe({
        next: (res) => {
          this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
        },
        error: (err) => {
          this.snackBarService.showSnackBar(`${err.error.error}`, 'error-snackbar', 3000, 'end', 'top')
          this.goLogin()
        },
        complete: () =>  this.router.navigate(['/dashboard'])

      })
  }

  goLogin(){
    this.router.navigate(['/auth/login'])
  }
}
