import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { Dashboard } from '../models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private api = environment.api;
  private httpClient = inject(HttpClient);

  getData(): Observable<Dashboard>{
    return this.httpClient.get<Dashboard>(this.api + 'dashboard')
  }


}
