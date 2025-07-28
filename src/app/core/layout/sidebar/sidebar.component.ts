import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, Renderer2, } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MenuComponent } from '@shared/components/menu/menu.component';
import { Item } from '@shared/models/item';
import { StorageService } from '@shared/services/storage.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    CommonModule,
    MenuComponent
  ],
})
export class SidebarComponent implements OnInit {

  @Input() isOpen: boolean = true
  @Input() status: string = 'open'
  mode: boolean = true;
  iconMode: string = 'light_mode'
  textMode: string = 'Modo claro'

  private renderer = inject(Renderer2)
  private storageService = inject(StorageService)
  private router = inject(Router)

  listItems: Item[] = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      allowedRoles: ['ROOT', 'ADMIN' ,'WRITE', 'READ']
    },
    {
      name: 'Productos',
      icon: 'store',
      route: '/products',
      allowedRoles: ['ROOT', 'ADMIN' ,'WRITE']
    },
    {
      name: 'Marcas',
      icon: 'local_offer',
      route: '/brands',
      allowedRoles: ['ROOT', 'ADMIN' ,'WRITE']
    },
    {
      name: 'Categorias',
      icon: 'category',
      route: '/categories',
      allowedRoles: ['ROOT', 'ADMIN' ,'WRITE']
    },
    {
      name: 'Proveedores',
      icon: 'shopping_bag',
      route: '/suppliers',
      allowedRoles: ['ROOT', 'ADMIN' ,'WRITE']
    },
    {
      name: 'Clientes',
      icon: 'person',
      route: '/customers',
      allowedRoles: ['ROOT', 'ADMIN' ,'WRITE']
    },
    {
      name: 'Usuarios',
      icon: 'person_search',
      route: '/users',
      allowedRoles: ['ROOT']
    },
  ]

  ngOnInit(): void {
    this.status = this.isOpen ? 'open' : 'close'
    if (this.storageService.exist('mode')) {
      this.iconMode = this.storageService.get('mode')
          const body = this.renderer.selectRootElement('body', true)

      if (this.iconMode === 'dark_mode') {
        this.renderer.addClass(body, 'dark')
        this.textMode = 'Modo oscuro'
      } else {
        this.renderer.removeClass(body, 'dark')
        this.textMode = 'Modo claro'
      }
    }
  }

  toggleTheme(mode: boolean) {
    this.mode = !mode;
    this.iconMode = this.mode ? 'light_mode' : 'dark_mode';
    this.textMode = this.mode ? 'Modo claro' : 'Modo oscuro';
    if (!this.storageService.exist('mode')) {
      this.storageService.set('mode', this.iconMode)
    }
    const body = this.renderer.selectRootElement('body', true)
    if (this.iconMode === 'dark_mode') {
      this.renderer.addClass(body, 'dark')
      this.storageService.set('mode', this.iconMode)
    }else {
      this.renderer.removeClass(body, 'dark')
      this.storageService.set('mode', this.iconMode)
    }
  }

  goToHome(){
    this.router.navigate(['/home'])
  }

}
