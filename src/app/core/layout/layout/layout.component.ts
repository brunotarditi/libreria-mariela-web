import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@core/layout/header/header.component';
import { SidebarComponent } from '@core/layout/sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule, MatSidenavModule, SidebarComponent, HeaderComponent,],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isOpen: boolean = true;
  status: string = 'open'
  toggle(isOpen: boolean): void {
    this.isOpen = isOpen;
    this.status = this.isOpen ? 'open' : 'close'
  }

}
