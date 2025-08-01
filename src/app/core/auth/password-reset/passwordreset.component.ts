import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '@core/services/auth.service';
import { SnackBarService } from '@shared/services/snackbar.service';
import { PasswordReset } from '@core/models/passwordReset';
import { PasswordValidator } from '@shared/utils/password.validator';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.css'],
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
export class PasswordResetComponent implements OnInit {

  title: string = 'Restablecer contraseña';
  token: string | null = null;
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBarService = inject(SnackBarService);

  passwordVisibility: Record<string, WritableSignal<boolean>> = {
    passReset: signal(true),
    confirPassReset: signal(true),
  };

  passwordResetForm = this.formBuilder.group({
    passwordReset: ['',  [Validators.required]],
    confirmPasswordReset: ['', [Validators.required]],
  },
    { validators: PasswordValidator.passwordsMatchValidator('passwordReset', 'confirmPasswordReset') }
  )

  get passwordReset() {
    return this.passwordResetForm.get('passwordReset') as FormControl;
  }

  get confirmPasswordReset() {
    return this.passwordResetForm.get('confirmPasswordReset') as FormControl;
  }

  sendPasswordResetForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  })

  get email() {
    return this.sendPasswordResetForm.get('email') as FormControl;
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.token = params.get('token');
    });
  }

  get isTokenFlow() {
    return !!this.token;
  }

  onChangePasswordIcon(field: string, event: MouseEvent) {
    const current = this.passwordVisibility[field]
      if(current){
        current.set(!current())
      }
    event.stopPropagation();
  }

  onPasswordReset() {
    const passwordReset: PasswordReset = {
        token: this.token,
        new_password: this.passwordReset.value

      }
    this.authService.resetPassword(passwordReset).subscribe({
        next: (res) => {
          this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
        },
        error: (err) => {
          this.snackBarService.showSnackBar(`${err.error.error}`, 'error-snackbar', 3000, 'end', 'top')
          this.goLogin()
        },
        complete: () =>  this.router.navigate(['/auth/login'])

    })
  }

  onSendPasswordReset(){
    this.authService.sendResetPassword(this.email.value).subscribe({
      next: (res) => {
        this.snackBarService.showSnackBar(`${res.message}`, 'success-snackbar', 3000, 'end', 'top')
      },
      error: (err) => {
        this.snackBarService.showSnackBar(`${err.error.error}`, 'error-snackbar', 3000, 'end', 'top')
      },
      complete: () =>  this.router.navigate(['/auth/login'])
    });
  }

  goLogin(){
    this.router.navigate(['/auth/login'])
  }

}
