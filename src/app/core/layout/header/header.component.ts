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
import { SearchService } from '@core/services/search.service';
import { AuthService } from '@core/services/auth.service';

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
  readonly searchService = inject(SearchService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  toggle(): void {
    this.toggleSidebar.emit(!this.isOpen);
  }

  onNotificationMenuOpened(): void {
    this.notificationService.fetchNotifications();
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

  deleteNotification(event: MouseEvent, id: number | string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/img/profile.png';
    }
  }
}
