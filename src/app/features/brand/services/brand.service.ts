import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Brand } from '../model/brand';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getAll(): Observable<Brand[]>{
    return this.httpClient.get<Brand[]>(this.api + 'brands')
  }

  getById(id: number): Observable<Brand>{
    return this.httpClient.get<Brand>(this.api + 'brands/' + id)
  }

  save(brand: Brand): Observable<Brand>{
    return this.httpClient.post<Brand>(this.api + 'brands', brand)
  }

  saveMany(brands: Brand[]): Observable<Brand[]>{
    return this.httpClient.post<Brand[]>(this.api + 'brands/list', brands)
  }

  update(id:number, brand: Brand): Observable<Brand>{
    return this.httpClient.put<Brand>(this.api + 'brands/' + id, brand)
  }

  deleteById(id:number): Observable<string>{
    return this.httpClient.delete<string>(this.api + 'brands/' + id)
  }
}
