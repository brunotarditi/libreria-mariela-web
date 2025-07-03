import { inject, Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  private authService = inject(AuthService)
  private router = inject(Router)

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[];
    this.authService.getRoles();
    if (!this.authService.isLogged() || !this.authService.hasAnyRole(expectedRoles)) {
      this.router.navigate(['/auth']);
      return false;
    }

    return true;
  }

}
