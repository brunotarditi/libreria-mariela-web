import { Component, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormControl } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Role } from "../model/role";

@Component({
  selector: 'dialog-assign-rol',
  templateUrl: 'dialog-assign-rol.html',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,],
})
export class DialogAssignRol {

  readonly dialogRef = inject(MatDialogRef<DialogAssignRol>);
  data = inject(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  roles: Role[] = [
    {id: 1, value: 'ADMIN', text: 'Admin'},
    {id: 2, value: 'WRITE', text: 'Escritura'},
    {id: 3, value: 'READ', text: 'Lectura'},
  ]

  roleForm = this.formBuilder.group({
    role: [0, Validators.required],
  });

  get role() {
    return this.roleForm.get('role') as FormControl
  }

  save(){
    if (this.roleForm.valid) {
      const roleName = this.roles.find(role => role.id === this.role.value)
      this.dialogRef.close(roleName?.value);
    }
  }

  cancel(){
    this.dialogRef.close()
  }
}


