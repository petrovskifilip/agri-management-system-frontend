import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Parcel, ParcelRequest, ParcelWeather } from '../models/parcel.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private apiUrl = `${environment.apiUrl}/parcels`;

  constructor(private http: HttpClient) {}

  createParcel(request: ParcelRequest): Observable<Parcel> {
    return this.http.post<Parcel>(this.apiUrl, request);
  }

  getAllParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(this.apiUrl);
  }

  getParcelsByFarm(farmId: number): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/farm/${farmId}`);
  }

  getParcelsByCrop(cropId: number): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/crop/${cropId}`);
  }

  getParcelById(id: number): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.apiUrl}/${id}`);
  }

  updateParcel(id: number, request: ParcelRequest): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.apiUrl}/${id}`, request);
  }

  deleteParcel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getParcelWeather(id: number): Observable<ParcelWeather> {
    return this.http.get<ParcelWeather>(`${this.apiUrl}/${id}/weather`);
  }
}

