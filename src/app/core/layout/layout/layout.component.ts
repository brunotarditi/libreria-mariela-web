import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@core/layout/header/header.component';
import { SidebarComponent } from '@core/layout/sidebar/sidebar.component';
import { LoadingService } from '@core/services/loading.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatProgressBarModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  loadingService = inject(LoadingService);
  private router = inject(Router);

  isOpen: boolean = true;
  status: string = 'open';

  ngOnInit(): void {
    this.checkScreenSize();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (typeof window !== 'undefined' && window.innerWidth <= 1000 && this.isOpen) {
          this.toggle(false);
        }
      });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 1000) {
        this.isOpen = false;
        this.status = 'close';
      } else {
        this.isOpen = true;
        this.status = 'open';
      }
    }
  }

  toggle(isOpen: boolean): void {
    this.isOpen = isOpen;
    this.status = this.isOpen ? 'open' : 'close';
  }
}
