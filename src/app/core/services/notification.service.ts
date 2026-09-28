import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';
import { catchError, of } from 'rxjs';

export interface AppNotification {
  id: number | string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  icon: string;
  route?: string;
}

export interface ApiNotificationItem {
  id: number;
  user_id?: number | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  icon: string;
  route?: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiNotificationResponse {
  data: ApiNotificationItem[];
  total: number;
  unread_count: number;
}

const STORAGE_KEY = 'libreria_mariela_notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.api;

  private notificationsSignal = signal<AppNotification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() => this.notificationsSignal().filter(n => !n.read).length);

  constructor() {
    this.loadFromStorage();
    if (this.authService.isLogged()) {
      this.fetchNotifications();
    }
  }

  fetchNotifications(): void {
    if (!this.authService.isLogged()) {
      return;
    }

    this.http.get<ApiNotificationResponse>(`${this.apiUrl}notifications`).pipe(
      catchError(err => {
        console.warn('No se pudieron obtener notificaciones del servidor:', err);
        return of(null);
      })
    ).subscribe(res => {
      if (res && Array.isArray(res.data)) {
        const mapped: AppNotification[] = res.data.map(item => ({
          id: item.id,
          title: item.title,
          message: item.message,
          timestamp: item.created_at,
          read: item.is_read,
          type: item.type,
          icon: item.icon,
          route: item.route
        }));
        this.notificationsSignal.set(mapped);
        this.saveToStorage(mapped);
      }
    });
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notificationsSignal.set(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading notifications from localStorage', e);
    }

    // Default notifications for first-time onboarding
    const initialNotifications: AppNotification[] = [
      {
        id: 'notif-1',
        title: 'Bienvenido al Sistema',
        message: 'Librería Mariela te permite gestionar productos, proveedores, clientes y ventas fácilmente.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info',
        icon: 'store',
        route: '/dashboard'
      },
      {
        id: 'notif-2',
        title: 'Gestión de Catálogo',
        message: 'Accede a Productos, Marcas y Categorías desde el menú Catálogo.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        type: 'success',
        icon: 'inventory_2',
        route: '/products'
      }
    ];

    this.notificationsSignal.set(initialNotifications);
    this.saveToStorage(initialNotifications);
  }

  private saveToStorage(items: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Error saving notifications to localStorage', e);
    }
  }

  markAsRead(id: number | string): void {
    const updated = this.notificationsSignal().map(n => n.id === id ? { ...n, read: true } : n);
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);

    if (typeof id === 'number' || !isNaN(Number(id))) {
      this.http.patch(`${this.apiUrl}notifications/${id}/read`, {}).pipe(
        catchError(err => of(null))
      ).subscribe();
    }
  }

  markAllAsRead(): void {
    const updated = this.notificationsSignal().map(n => ({ ...n, read: true }));
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);

    this.http.patch(`${this.apiUrl}notifications/read-all`, {}).pipe(
      catchError(err => of(null))
    ).subscribe();
  }

  clearAll(): void {
    this.notificationsSignal.set([]);
    this.saveToStorage([]);

    this.http.delete(`${this.apiUrl}notifications`).pipe(
      catchError(err => of(null))
    ).subscribe();
  }

  deleteNotification(id: number | string): void {
    const updated = this.notificationsSignal().filter(n => n.id !== id);
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);

    if (typeof id === 'number' || !isNaN(Number(id))) {
      this.http.delete(`${this.apiUrl}notifications/${id}`).pipe(
        catchError(err => of(null))
      ).subscribe();
    }
  }

  addNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [newNotif, ...this.notificationsSignal()];
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);
  }
}
