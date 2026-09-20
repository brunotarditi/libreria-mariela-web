import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = (route.data['roles'] as string[]) || [];

  if (!authService.isLogged() || !authService.hasAnyRole(expectedRoles)) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
};

