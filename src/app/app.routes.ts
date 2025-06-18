import { Routes } from '@angular/router';
import { AuthGuard } from '@core/services/auth.guard';
import { RoleGuard } from '@core/services/role.guard';
import { LayoutComponent } from '@layout/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./modules/home/home.component').then(c => c.HomeComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'WRITE'] }
      },
      {
        path: 'brands',
        loadComponent: () => import('./modules/brand/components/brand.component').then(c => c.BrandComponent),
        canActivate: [AuthGuard],
      },
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./core/auth/auth.component').then(c => c.AuthComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
];
