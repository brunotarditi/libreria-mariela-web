import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Customer } from '../model/customer';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getAll(): Observable<Customer[]>{
    return this.httpClient.get<Customer[]>(this.api + 'customers')
  }

  getById(id: number): Observable<Customer>{
    return this.httpClient.get<Customer>(this.api + 'customers/' + id)
  }

  save(customer: Customer): Observable<Customer>{
    return this.httpClient.post<Customer>(this.api + 'customers', customer)
  }

  saveMany(customers: Customer[]): Observable<Customer[]>{
    return this.httpClient.post<Customer[]>(this.api + 'customers/list', customers)
  }

  update(id:number, customer: Customer): Observable<Customer>{
    return this.httpClient.put<Customer>(this.api + 'customers/' + id, customer)
  }

  deleteById(id:number): Observable<string>{
    return this.httpClient.delete<string>(this.api + 'customers/' + id)
  }
}
