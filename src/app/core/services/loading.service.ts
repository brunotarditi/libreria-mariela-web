import { inject, Injectable, signal, computed } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private router = inject(Router);
  private activeRequests = signal<number>(0);

  readonly isLoading = computed(() => this.activeRequests() > 0);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.hide();
      }
    });
  }

  show(): void {
    this.activeRequests.update(count => count + 1);
  }

  hide(): void {
    this.activeRequests.update(count => Math.max(0, count - 1));
  }
}
