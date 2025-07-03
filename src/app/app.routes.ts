import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { RoleGuard } from '@core/guards/role.guard';
import { LayoutComponent } from '@core/layout/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/layout/layout.component').then(c => LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ADMIN', 'WRITE'] }
      },
      {
        path: 'brands',
        loadComponent: () => import('./features/brand/components/brand.component').then(c => c.BrandComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/category/components/category.component').then(c => c.CategoryComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'products',
        loadComponent: () => import('./features/product/components/list/products.component').then(c => c.ProductsComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'products/detail',
        loadComponent: () => import('./features/product/components/detail/product.component').then(c => c.ProductComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'products/detail/:id',
        loadComponent: () => import('./features/product/components/detail/product.component').then(c => c.ProductComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/supplier/components/supplier.component').then(c => c.SupplierComponent),
        canActivate: [AuthGuard],
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customer/components/customer.component').then(c => c.CustomerComponent),
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
