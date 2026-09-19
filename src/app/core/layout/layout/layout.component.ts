import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@core/layout/header/header.component';
import { SidebarComponent } from '@core/layout/sidebar/sidebar.component';
import { LoadingService } from '@core/services/loading.service';

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
export class LayoutComponent {
  loadingService = inject(LoadingService);
  isOpen: boolean = true;
  status: string = 'open';

  toggle(isOpen: boolean): void {
    this.isOpen = isOpen;
    this.status = this.isOpen ? 'open' : 'close';
  }
}
