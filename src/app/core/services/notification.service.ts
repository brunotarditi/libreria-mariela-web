import { Injectable, computed, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'alert';
  icon: string;
  route?: string;
}

const STORAGE_KEY = 'libreria_mariela_notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<AppNotification[]>([]);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = computed(() => this.notificationsSignal().filter(n => !n.read).length);

  constructor() {
    this.loadFromStorage();
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
        message: 'Accede a Productos, Marcas y Categorías desde el menú Catálogo o con el atajo rápido [N].',
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

  markAsRead(id: string): void {
    const updated = this.notificationsSignal().map(n => n.id === id ? { ...n, read: true } : n);
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);
  }

  markAllAsRead(): void {
    const updated = this.notificationsSignal().map(n => ({ ...n, read: true }));
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);
  }

  clearAll(): void {
    this.notificationsSignal.set([]);
    this.saveToStorage([]);
  }

  deleteNotification(id: string): void {
    const updated = this.notificationsSignal().filter(n => n.id !== id);
    this.notificationsSignal.set(updated);
    this.saveToStorage(updated);
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
