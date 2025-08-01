import { Injectable } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

@Injectable({
  providedIn : 'root'
})
export class PasswordValidator {

  public static passwordsMatchValidator(passwordKey: string, confirmPasswordKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordKey);
      const confirmPassword = control.get(confirmPasswordKey);
      if (!password!.value || !confirmPassword!.value){
        return null;
      }

      if (password!.value !== confirmPassword!.value) {
        confirmPassword!.setErrors({ passwordsMismatch: true });
        return { passwordsMismatch: true };
      } else {
        if (confirmPassword!.errors && confirmPassword!.errors['passwordsMismatch']) {
          confirmPassword!.setErrors(null);
        }
        return null;
      }

    };
  }
}
