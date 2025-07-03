import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Category } from '../model/category';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getAll(): Observable<Category[]>{
    return this.httpClient.get<Category[]>(this.api + 'categories')
  }

  getById(id: number): Observable<Category>{
    return this.httpClient.get<Category>(this.api + 'categories/' + id)
  }

  save(category: Category): Observable<Category>{
    return this.httpClient.post<Category>(this.api + 'categories', category)
  }

    saveMany(categories: Category[]): Observable<Category[]>{
      return this.httpClient.post<Category[]>(this.api + 'categories/list', categories)
    }

  update(id:number, category: Category): Observable<Category>{
    return this.httpClient.put<Category>(this.api + 'categories/' + id, category)
  }

  deleteById(id:number): Observable<string>{
    return this.httpClient.delete<string>(this.api + 'categories/' + id)
  }
}
