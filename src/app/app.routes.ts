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
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'brands',
        loadComponent: () => import('./features/brand/components/list/brands.component').then(c => c.BrandsComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'brands/detail/:id',
        loadComponent: () => import('./features/brand/components/detail/brand.component').then(c => c.BrandComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/category/components/list/categories.component').then(c => c.CategoriesComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'categories/detail/:id',
        loadComponent: () => import('./features/category/components/detail/category.component').then(c => c.CategoryComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'products',
        loadComponent: () => import('./features/product/components/list/products.component').then(c => c.ProductsComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'products/detail/:id',
        loadComponent: () => import('./features/product/components/detail/product.component').then(c => c.ProductComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./features/supplier/components/list/suppliers.component').then(c => c.SuppliersComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'suppliers/detail/:id',
        loadComponent: () => import('./features/supplier/components/detail/supplier.component').then(c => c.SupplierComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customer/components/list/customers.component').then(c => c.CustomersComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE', 'READ'] }
      },
      {
        path: 'customers/detail/:id',
        loadComponent: () => import('./features/customer/components/detail/customer.component').then(c => c.CustomerComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['ROOT', 'ADMIN', 'WRITE'] }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/user/components/user.component').then(c => c.UserComponent),
        canActivate: [AuthGuard, RoleGuard],
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
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
];
