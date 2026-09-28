import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Supplier } from '../model/supplier';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getAll(): Observable<Supplier[]>{
    return this.httpClient.get<Supplier[]>(this.api + 'suppliers')
  }

  getById(id: number): Observable<Supplier>{
    return this.httpClient.get<Supplier>(this.api + 'suppliers/' + id)
  }

  save(supplier: Supplier): Observable<Supplier>{
    return this.httpClient.post<Supplier>(this.api + 'suppliers', supplier)
  }

  saveMany(suppliers: Supplier[]): Observable<Supplier[]>{
    return this.httpClient.post<Supplier[]>(this.api + 'suppliers/list', suppliers)
  }

  update(id:number, supplier: Supplier): Observable<Supplier>{
    return this.httpClient.put<Supplier>(this.api + 'suppliers/' + id, supplier)
  }

  deleteById(id:number): Observable<string>{
    return this.httpClient.delete<string>(this.api + 'suppliers/' + id)
  }

  bulkDelete(ids: number[]): Observable<{ success: boolean; message: string; deleted_count: number }> {
    return this.httpClient.post<{ success: boolean; message: string; deleted_count: number }>(this.api + 'suppliers/bulk-delete', { ids });
  }

  exportExcel(): Observable<Blob> {
    return this.httpClient.get<Blob>(this.api + 'suppliers/export', {
      responseType: 'blob' as 'json',
    });
  }
}
