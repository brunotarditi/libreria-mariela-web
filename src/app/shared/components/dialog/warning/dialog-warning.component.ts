import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogWarningData } from '@shared/models/dialog';

@Component({
  selector: 'app-dialog-warning',
  templateUrl: './dialog-warning.component.html',
  styleUrl: './dialog-warning.component.css',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],

})
export class DialogWarningComponent {

  readonly dialogRef = inject(MatDialogRef<DialogWarningComponent>);
  readonly data = inject<DialogWarningData>(MAT_DIALOG_DATA);

  get title(): string {
    return this.data.title;
  }

  save(){
    this.dialogRef.close('confirm')
  }

  cancel(){
    this.dialogRef.close()
  }

}
