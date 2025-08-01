import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FieldControlConfig, DialogFormData } from '@shared/models/dialog';

@Component({
  selector: 'app-dialog-form',
  templateUrl: './dialog-form.component.html',
  styleUrl: './dialog-form.component.css',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
  ],

})
export class DialogFormComponent implements OnInit {

  readonly dialogRef = inject(MatDialogRef<DialogFormComponent>);
  readonly data = inject<DialogFormData>(MAT_DIALOG_DATA);
  private formBuilder = inject(FormBuilder);

  entityForm = this.formBuilder.group({});

  ngOnInit(): void {
    if (this.data.fields) {
      this.addControl(this.data.fields);
    }
  }

  addControl(fieldsConfig: FieldControlConfig[]): void {
    fieldsConfig.forEach((control) => {
      this.entityForm.addControl(
        control.name,
        this.formBuilder.control('', control.validators ?? [])
      );
    });
  }

  get title(): string {
    return this.data.title;
  }

  save(){
    if (this.entityForm.valid) {
      this.dialogRef.close(this.entityForm.value);
    }
  }

  cancel(){
    this.dialogRef.close()
  }

}
