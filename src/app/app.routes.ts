import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { pendingChangesGuard } from '@core/guards/pending-changes.guard';

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
    loadComponent: () => import('./core/layout/layout/layout.component').then(c => c.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'brands',
        loadComponent: () => import('./features/brand/components/list/brands.component').then(c => c.BrandsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'brands/detail/:id',
        loadComponent: () => import('./features/brand/components/detail/brand.component').then(c => c.BrandComponent),
        canActivate: [authGuard, roleGuard],
        canDeactivate: [pendingChangesGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/category/components/list/categories.component').then(c => c.CategoriesComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'categories/detail/:id',
        loadComponent: () => import('./features/category/components/detail/category.component').then(c => c.CategoryComponent),
        canActivate: [authGuard, roleGuard],
        canDeactivate: [pendingChangesGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'products',
        loadComponent: () => import('./features/product/components/list/products.component').then(c => c.ProductsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'products/detail/:id',
        loadComponent: () => import('./features/product/components/detail/product.component').then(c => c.ProductComponent),
        canActivate: [authGuard, roleGuard],
        canDeactivate: [pendingChangesGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/supplier/components/list/suppliers.component').then(c => c.SuppliersComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'suppliers/detail/:id',
        loadComponent: () => import('./features/supplier/components/detail/supplier.component').then(c => c.SupplierComponent),
        canActivate: [authGuard, roleGuard],
        canDeactivate: [pendingChangesGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customer/components/list/customers.component').then(c => c.CustomersComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'customers/detail/:id',
        loadComponent: () => import('./features/customer/components/detail/customer.component').then(c => c.CustomerComponent),
        canActivate: [authGuard, roleGuard],
        canDeactivate: [pendingChangesGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/user/components/user.component').then(c => c.UserComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ROOT'] }
      },
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./core/auth/auth.component').then(c => c.AuthComponent),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./core/auth/login/login.component').then(c => c.LoginComponent),
      },
      {
        path: 'callback',
        loadComponent: () => import('./core/auth/callback/auth-callback.component').then(c => c.AuthCallbackComponent),
      }
    ]
  },
  {
    path: '404',
    loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
