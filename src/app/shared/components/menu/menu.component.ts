import { Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Item } from '@shared/models/item';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatMenuModule, RouterLink, RouterLinkActive],
})
export class MenuComponent implements OnInit {

  typeMode = input<boolean>(true);
  iconMode = input<string>();
  textMode = input<string>();
  isClosed = input<boolean>(false);
  listItems = input<Item[]>();

  changeMode = output<boolean>();

  private authService = inject(AuthService);
  private router = inject(Router);

  expandedItems = signal<Record<string, boolean>>({});

  filterItems = computed(() => {
    if (!this.listItems()) {
      return [];
    }
    const userRoles = this.authService.roles();
    return this.listItems()
      ?.filter(item => {
        if (!item.allowedRoles || item.allowedRoles.length === 0) {
          return true;
        }
        return item.allowedRoles.some(role => userRoles.includes(role));
      })
      .map(item => {
        if (!item.children) {
          return item;
        }
        const filteredChildren = item.children.filter(child => {
          if (!child.allowedRoles || child.allowedRoles.length === 0) {
            return true;
          }
          return child.allowedRoles.some(role => userRoles.includes(role));
        });
        return {
          ...item,
          children: filteredChildren
        };
      })
      .filter(item => !item.children || item.children.length > 0);
  });

  ngOnInit(): void {
    this.autoExpandActiveRoutes();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.autoExpandActiveRoutes();
      });
  }

  private autoExpandActiveRoutes(): void {
    const currentUrl = this.router.url;
    this.listItems()?.forEach(item => {
      if (item.children?.some(c => c.route && currentUrl.startsWith(c.route))) {
        this.expandedItems.update(state => ({
          ...state,
          [item.name]: true
        }));
      }
    });
  }

  isParentActive(item: Item): boolean {
    const currentUrl = this.router.url;
    if (item.children) {
      return item.children.some(child => child.route && currentUrl.startsWith(child.route));
    }
    return !!(item.route && currentUrl.startsWith(item.route));
  }

  toggleExpand(item: Item, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.isClosed()) {
      return;
    }
    const currentStatus = this.isExpanded(item);
    this.expandedItems.update(state => ({
      ...state,
      [item.name]: !currentStatus
    }));
  }

  isExpanded(item: Item): boolean {
    const state = this.expandedItems()[item.name];
    if (state !== undefined) {
      return state;
    }
    return this.isParentActive(item);
  }

  toggleTheme() {
    this.changeMode.emit(this.typeMode());
  }

  logOut(){
    this.authService.logOut();
  }

}
