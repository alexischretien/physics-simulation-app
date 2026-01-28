import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:8080'

  private http = inject(HttpClient)

  constructor() {}

  getSimulations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/simulations`)
  }

  getSimulationByIdNested(id: Number): Observable<any> {
    return this.http.get(`${this.baseUrl}/simulations/${id}/nested`)
  }
}