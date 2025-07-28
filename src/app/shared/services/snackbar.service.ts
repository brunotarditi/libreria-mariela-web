import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private _snackBar = inject(MatSnackBar);

  showSnackBar(message: string, panelClass: string, duration: number, horizontal: MatSnackBarHorizontalPosition, vertical: MatSnackBarVerticalPosition){
    return this._snackBar.open(message, 'Cerrar', {
            horizontalPosition: horizontal,
            verticalPosition: vertical,
            duration: duration,
            panelClass: [panelClass]
    });
  }
}
