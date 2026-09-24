import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppNotification, NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
  ]
})
export class HeaderComponent {
  @Input() isOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();

  readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  toggle() {
    this.toggleSidebar.emit(!this.isOpen);
  }

  onNotificationClick(notif: AppNotification): void {
    this.notificationService.markAsRead(notif.id);
    if (notif.route) {
      this.router.navigate([notif.route]);
    }
  }

  markAllRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.markAllAsRead();
  }

  clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationService.clearAll();
  }

  deleteNotification(event: MouseEvent, id: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }
}
