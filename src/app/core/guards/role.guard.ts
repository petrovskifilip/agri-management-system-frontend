import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/enums';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Role[];
  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

