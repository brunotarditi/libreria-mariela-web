import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface SearchProductItem {
  id: number;
  name: string;
  description?: string;
  price?: number;
}

export interface SearchBrandItem {
  id: number;
  name: string;
}

export interface SearchCategoryItem {
  id: number;
  name: string;
}

export interface SearchSupplierItem {
  id: number;
  name: string;
  contact?: string;
}

export interface SearchCustomerItem {
  id: number;
  name: string;
  email?: string;
}

export interface GlobalSearchResult {
  products?: SearchProductItem[];
  brands?: SearchBrandItem[];
  categories?: SearchCategoryItem[];
  suppliers?: SearchSupplierItem[];
  customers?: SearchCustomerItem[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.api;

  readonly isOpen = signal<boolean>(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update(val => !val);
  }

  search(query: string): Observable<GlobalSearchResult> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of({
        products: [],
        brands: [],
        categories: [],
        suppliers: [],
        customers: []
      });
    }

    return this.http.get<GlobalSearchResult>(`${this.apiUrl}search`, {
      params: { q: trimmed }
    }).pipe(
      catchError(err => {
        console.warn('Error fetching search results:', err);
        return of({
          products: [],
          brands: [],
          categories: [],
          suppliers: [],
          customers: []
        });
      })
    );
  }
}
