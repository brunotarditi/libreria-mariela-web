import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface DialogData {
  type: 'category' | 'brand'
}

@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrl: './dialog-form.component.css',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
  ],

})
export class DialogFormComponent {

  readonly dialogRef = inject(MatDialogRef<DialogFormComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder)

  entityForm = this.formBuilder.group({
    name: ['', [Validators.required,  Validators.maxLength(65)]],
  });

  get name() {
    return this.entityForm.get('name') as FormControl
  }

  get entityName(): string {
    return this.data.type === 'category' ? 'Categoría' : 'Marca';
  }

  save(){
    if (this.entityForm.valid) {
      this.dialogRef.close(this.name.value);
    }
  }

  cancel(){
    this.dialogRef.close()
  }

}
