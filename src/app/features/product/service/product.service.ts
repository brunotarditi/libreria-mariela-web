import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Product, ProductData } from '../model/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getAll(): Observable<ProductData[]>{
    return this.httpClient.get<ProductData[]>(this.api + 'products')
  }

  getById(id: number): Observable<Product>{
    return this.httpClient.get<Product>(this.api + 'products/' + id)
  }

  save(product: Product): Observable<Product>{
    return this.httpClient.post<Product>(this.api + 'products', product)
  }

  saveMany(products: Product[]): Observable<Product[]>{
    return this.httpClient.post<Product[]>(this.api + 'products/list', products)
  }

  update(id:number, product: Product): Observable<Product>{
    return this.httpClient.put<Product>(this.api + 'products/' + id, product)
  }

  deleteById(id:number): Observable<string>{
    return this.httpClient.delete<string>(this.api + 'products/' + id)
  }

  exportExcel(): Observable<Blob> {
    return this.httpClient.get<Blob>(this.api + 'products/export', {
      responseType: 'blob' as 'json',
    })
  }

  importExcel(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<string>(this.api + 'products/import', formData)
  }
}
