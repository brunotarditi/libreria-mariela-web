import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ACCESS_TOKEN } from "@core/constants/constants";
import { StorageService } from "@shared/services/storage.service";
import { Observable } from "rxjs";
@Injectable({
    providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
    private storageService = inject(StorageService)
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const token = this.storageService.get(ACCESS_TOKEN);

      if (token) {
        const authReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(authReq);
      }

      return next.handle(request);
      }

}
