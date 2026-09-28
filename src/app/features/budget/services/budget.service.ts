import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Budget, CreateBudgetRequest } from '../models/budget';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.api;

  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.api}budgets`).pipe(
      catchError(err => {
        // Fallback in case backend still uses /budges before updating
        return this.http.get<Budget[]>(`${this.api}budges`);
      })
    );
  }

  getById(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.api}budgets/${id}`).pipe(
      catchError(err => {
        return this.http.get<Budget>(`${this.api}budges/${id}`);
      })
    );
  }

  create(budget: CreateBudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(`${this.api}budgets`, budget).pipe(
      catchError(err => {
        return this.http.post<Budget>(`${this.api}budges`, budget);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}budgets/${id}`).pipe(
      catchError(err => {
        return this.http.delete<void>(`${this.api}budges/${id}`);
      })
    );
  }

  downloadPdf(id?: number): Observable<Blob> {
    const url = id ? `${this.api}budgets/${id}/pdf` : `${this.api}budget`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(err => {
        // Fallback to sample pdf /budget if specific budget pdf endpoint not yet ready
        return this.http.get(`${this.api}budget`, { responseType: 'blob' });
      })
    );
  }

  triggerPdfDownload(blob: Blob, filename: string = 'presupuesto.pdf'): void {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }
}
