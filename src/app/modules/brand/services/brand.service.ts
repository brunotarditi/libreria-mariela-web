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

}
