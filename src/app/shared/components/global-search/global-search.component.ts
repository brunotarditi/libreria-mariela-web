import { Component, ElementRef, HostListener, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { GlobalSearchResult, SearchService } from '@core/services/search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule
  ],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent {
  readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  readonly searchControl = new FormControl('');
  readonly results = signal<GlobalSearchResult | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly hasSearched = signal<boolean>(false);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((val) => {
        if (!val || !val.trim()) {
          this.results.set(null);
          this.isLoading.set(false);
          this.hasSearched.set(false);
        } else {
          this.isLoading.set(true);
          this.hasSearched.set(true);
        }
      }),
      switchMap((val) => {
        if (!val || !val.trim()) {
          return [];
        }
        return this.searchService.search(val);
      })
    ).subscribe({
      next: (res) => {
        this.results.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    effect(() => {
      if (this.searchService.isOpen()) {
        setTimeout(() => {
          this.searchInput?.nativeElement?.focus();
        }, 60);
      } else {
        this.searchControl.setValue('', { emitEvent: false });
        this.results.set(null);
        this.hasSearched.set(false);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchService.toggle();
    } else if (event.key === 'Escape' && this.searchService.isOpen()) {
      this.close();
    }
  }

  close(): void {
    this.searchService.close();
  }

  clear(): void {
    this.searchControl.setValue('');
    this.results.set(null);
    this.hasSearched.set(false);
    this.searchInput?.nativeElement?.focus();
  }

  navigateTo(route: string): void {
    this.close();
    this.router.navigate([route]);
  }

  hasAnyResults(): boolean {
    const r = this.results();
    if (!r) return false;
    return !!(
      (r.products && r.products.length > 0) ||
      (r.brands && r.brands.length > 0) ||
      (r.categories && r.categories.length > 0) ||
      (r.suppliers && r.suppliers.length > 0) ||
      (r.customers && r.customers.length > 0)
    );
  }
}
