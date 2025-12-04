import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Farm, FarmRequest } from '../models/farm.model';

@Injectable({
  providedIn: 'root'
})
export class FarmService {
  private apiUrl = `${environment.apiUrl}/farms`;

  constructor(private http: HttpClient) {}

  createFarm(request: FarmRequest): Observable<Farm> {
    return this.http.post<Farm>(this.apiUrl, request);
  }

  getAllFarms(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.apiUrl);
  }

  getFarmById(id: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.apiUrl}/${id}`);
  }

  updateFarm(id: number, request: FarmRequest): Observable<Farm> {
    return this.http.put<Farm>(`${this.apiUrl}/${id}`, request);
  }

  deleteFarm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

