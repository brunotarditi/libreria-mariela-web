import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '@shared/services/storage.service';
import { ACCESS_TOKEN } from '@core/constants/constants';

export const authGuard: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (storageService.get(ACCESS_TOKEN)) {
    return true;
  }

  router.navigate(['/auth']);
  return false;
};

