import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fertilization, FertilizationRequest } from '../models/fertilization.model';
import { FertilizationStatus } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class FertilizationService {
  private apiUrl = `${environment.apiUrl}/fertilizations`;

  constructor(private http: HttpClient) {}

  createFertilization(request: FertilizationRequest): Observable<Fertilization> {
    return this.http.post<Fertilization>(this.apiUrl, request);
  }

  scheduleFertilization(parcelId: number, scheduledDatetime: string, fertilizerType: string): Observable<Fertilization> {
    const params = new HttpParams()
      .set('parcelId', parcelId.toString())
      .set('scheduledDatetime', scheduledDatetime)
      .set('fertilizerType', fertilizerType);
    return this.http.post<Fertilization>(`${this.apiUrl}/schedule`, null, { params });
  }

  getAllFertilizations(): Observable<Fertilization[]> {
    return this.http.get<Fertilization[]>(this.apiUrl);
  }

  getFertilizationById(id: number): Observable<Fertilization> {
    return this.http.get<Fertilization>(`${this.apiUrl}/${id}`);
  }

  getFertilizationsByParcel(parcelId: number): Observable<Fertilization[]> {
    return this.http.get<Fertilization[]>(`${this.apiUrl}/parcel/${parcelId}`);
  }

  getFertilizationsByStatus(status: FertilizationStatus): Observable<Fertilization[]> {
    return this.http.get<Fertilization[]>(`${this.apiUrl}/status/${status}`);
  }

  getFertilizationsByStatusForUser(status: FertilizationStatus): Observable<Fertilization[]> {
    return this.http.get<Fertilization[]>(`${this.apiUrl}/user/status/${status}`);
  }

  updateFertilization(id: number, request: FertilizationRequest): Observable<Fertilization> {
    return this.http.put<Fertilization>(`${this.apiUrl}/${id}`, request);
  }

  completeFertilization(id: number, notes?: string): Observable<Fertilization> {
    return this.http.patch<Fertilization>(`${this.apiUrl}/${id}/complete`, notes);
  }

  cancelFertilization(id: number, notes?: string): Observable<Fertilization> {
    return this.http.patch<Fertilization>(`${this.apiUrl}/${id}/cancel`, notes);
  }

  updateStatus(id: number, status: FertilizationStatus): Observable<Fertilization> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Fertilization>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  deleteFertilization(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

