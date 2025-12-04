import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        // Forbidden - insufficient permissions
        console.error('Access forbidden:', error.message);
      } else if (error.status === 404) {
        console.error('Resource not found:', error.message);
      } else if (error.status >= 500) {
        console.error('Server error:', error.message);
      }

      return throwError(() => error);
    })
  );
};

