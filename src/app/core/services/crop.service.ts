import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Crop, CropRequest } from '../models/crop.model';

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private apiUrl = `${environment.apiUrl}/crops`;

  constructor(private http: HttpClient) {}

  createCrop(request: CropRequest): Observable<Crop> {
    return this.http.post<Crop>(this.apiUrl, request);
  }

  getAllCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(this.apiUrl);
  }

  getCropById(id: number): Observable<Crop> {
    return this.http.get<Crop>(`${this.apiUrl}/${id}`);
  }

  updateCrop(id: number, request: CropRequest): Observable<Crop> {
    return this.http.put<Crop>(`${this.apiUrl}/${id}`, request);
  }

  deleteCrop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

