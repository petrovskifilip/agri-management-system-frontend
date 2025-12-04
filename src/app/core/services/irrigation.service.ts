import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Irrigation, IrrigationRequest } from '../models/irrigation.model';
import { IrrigationStatus } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class IrrigationService {
  private apiUrl = `${environment.apiUrl}/irrigations`;

  constructor(private http: HttpClient) {}

  createIrrigation(request: IrrigationRequest): Observable<Irrigation> {
    return this.http.post<Irrigation>(this.apiUrl, request);
  }

  getAllIrrigations(): Observable<Irrigation[]> {
    return this.http.get<Irrigation[]>(this.apiUrl);
  }

  getIrrigationById(id: number): Observable<Irrigation> {
    return this.http.get<Irrigation>(`${this.apiUrl}/${id}`);
  }

  getIrrigationsByParcel(parcelId: number): Observable<Irrigation[]> {
    return this.http.get<Irrigation[]>(`${this.apiUrl}/parcel/${parcelId}`);
  }

  getIrrigationsByStatus(status: IrrigationStatus): Observable<Irrigation[]> {
    return this.http.get<Irrigation[]>(`${this.apiUrl}/status/${status}`);
  }

  getUpcomingIrrigations(): Observable<Irrigation[]> {
    return this.http.get<Irrigation[]>(`${this.apiUrl}/upcoming`);
  }

  updateIrrigation(id: number, request: IrrigationRequest): Observable<Irrigation> {
    return this.http.put<Irrigation>(`${this.apiUrl}/${id}`, request);
  }

  updateStatus(id: number, status: IrrigationStatus): Observable<Irrigation> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Irrigation>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  deleteIrrigation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  executeIrrigation(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/execute`, null, { responseType: 'text' });
  }

  stopIrrigation(id: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/${id}/stop`, null, { responseType: 'text' });
  }
}

