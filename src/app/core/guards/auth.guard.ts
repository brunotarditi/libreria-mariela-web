import { inject, Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { StorageService } from "@shared/services/storage.service";
import { ACCESS_TOKEN } from "@core/constants/constants";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private router = inject(Router);
  private storageService = inject(StorageService);
  canActivate(): boolean {
    const access_token = this.storageService.get(ACCESS_TOKEN)
    if (access_token) {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false;
    }
  }
}
