import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SnackBarService } from "@shared/services/snackbar.service";
import { catchError, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class ErrorInterceptor implements HttpInterceptor {
  private snackBarService = inject(SnackBarService);
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ha ocurrido un error inesperado';

        // Personaliza el mensaje según el tipo de error
        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          errorMessage = error.error?.error || error.message || errorMessage;
        }

        // Muestra el error usando el SnackBarService
        this.snackBarService.showSnackBar(
          errorMessage,
          'error-snackbar',
          3000,
          'end',
          'top'
        );

        return throwError(() => new Error(errorMessage));
      })
    );
  }




}
