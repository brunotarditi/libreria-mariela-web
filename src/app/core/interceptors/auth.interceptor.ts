import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ACCESS_TOKEN } from '@core/constants/constants';
import { AuthService } from '@core/services/auth.service';
import { StorageService } from '@shared/services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const storageService = inject(StorageService);

  if (!authService.isLogged()) {
    return next(req);
  }

  const token = storageService.get(ACCESS_TOKEN);
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        authService.logOut();
      }
      return throwError(() => err);
    })
  );
};

