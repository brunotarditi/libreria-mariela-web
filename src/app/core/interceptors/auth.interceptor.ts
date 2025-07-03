import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ACCESS_TOKEN } from "@core/constants/constants";
import { AuthService } from "@core/services/auth.service";
import { StorageService } from "@shared/services/storage.service";
import { catchError, Observable, throwError } from "rxjs";
@Injectable({
    providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private storageService = inject(StorageService)
  private authService = inject(AuthService)
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (!this.authService.isLogged()) {
        return next.handle(request);
      }
      const token = this.storageService.get(ACCESS_TOKEN);
      if (token) {
        const authReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(authReq).pipe(
          catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
              this.authService.logOut();
              return throwError(() => err);
            }
            return throwError(() => err);
          })
        );
      }
    return next.handle(request);
  }

}
