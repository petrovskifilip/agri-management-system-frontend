import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },
      {
        path: 'farms',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/farms/farms-list/farms-list.component').then(m => m.FarmsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/farms/farm-form/farm-form.component').then(m => m.FarmFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/dashboard/farms/farm-details/farm-details.component').then(m => m.FarmDetailsComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/dashboard/farms/farm-form/farm-form.component').then(m => m.FarmFormComponent)
          }
        ]
      },
      {
        path: 'crops',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/crops/crops-list/crops-list.component').then(m => m.CropsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/crops/crop-form/crop-form.component').then(m => m.CropFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/dashboard/crops/crop-details/crop-details.component').then(m => m.CropDetailsComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/dashboard/crops/crop-form/crop-form.component').then(m => m.CropFormComponent)
          }
        ]
      },
      {
        path: 'parcels',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/parcels/parcels-list/parcels-list.component').then(m => m.ParcelsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/parcels/parcel-form/parcel-form.component').then(m => m.ParcelFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/dashboard/parcels/parcel-details/parcel-details.component').then(m => m.ParcelDetailsComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/dashboard/parcels/parcel-form/parcel-form.component').then(m => m.ParcelFormComponent)
          }
        ]
      },
      {
        path: 'irrigation',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/dashboard/irrigation/irrigations-list/irrigations-list.component').then(m => m.IrrigationsListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/dashboard/irrigation/irrigation-form/irrigation-form.component').then(m => m.IrrigationFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/dashboard/irrigation/irrigation-details/irrigation-details.component').then(m => m.IrrigationDetailsComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/dashboard/irrigation/irrigation-form/irrigation-form.component').then(m => m.IrrigationFormComponent)
          }
        ]
      },
      {
        path: 'fertilization',
        loadComponent: () => import('./shared/components/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./shared/components/coming-soon/coming-soon.component').then(m => m.ComingSoonComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
