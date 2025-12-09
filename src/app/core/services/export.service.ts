import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private apiUrl = `${environment.apiUrl}/export`;

  constructor(private http: HttpClient) {}

  /**
   * Download a file from the server
   * @param url The URL to download from
   * @param filename The filename to save as
   */
  private downloadFile(url: string, filename: string): Observable<void> {
    console.log('Downloading from:', url);

    return new Observable<void>((observer) => {
      this.http.get(url, {
        responseType: 'blob',
        observe: 'response',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }).subscribe({
        next: (response) => {
          console.log('Response status:', response.status);
          console.log('Response headers:', response.headers.keys());

          const blob = response.body;
          if (!blob) {
            observer.error(new Error('No file content received'));
            return;
          }

          // Try to get filename from Content-Disposition header
          const contentDisposition = response.headers.get('Content-Disposition');
          if (contentDisposition) {
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches && matches[1]) {
              filename = matches[1].replace(/['"]/g, '');
            }
          }

          // Create a blob URL and trigger download
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          link.style.display = 'none';

          // Append to body, click, and remove
          document.body.appendChild(link);
          link.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            observer.next();
            observer.complete();
          }, 100);
        },
        error: (error) => {
          console.error('===== EXPORT ERROR =====');
          console.error('Full error object:', error);
          console.error('Error status:', error.status);
          console.error('Error statusText:', error.statusText);
          console.error('Error message:', error.message);
          console.error('Error.error:', error.error);
          console.error('=======================');

          // Create a user-friendly error message
          let userMessage = `Export failed (Status ${error.status})`;

          // If the error response is a blob, try to read it as text
          if (error.error instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const errorText = reader.result as string;
              console.error('Error response body as text:', errorText);

              try {
                const errorObj = JSON.parse(errorText);
                console.error('Parsed error object:', errorObj);
                userMessage = errorObj.message || errorObj.error || userMessage;
              } catch (parseError) {
                console.error('Could not parse error as JSON');
                userMessage = errorText || userMessage;
              }

              observer.error(new Error(userMessage));
            };
            reader.onerror = () => {
              console.error('Failed to read error blob');
              observer.error(new Error(userMessage));
            };
            reader.readAsText(error.error);
          } else {
            if (error.error?.message) {
              userMessage = error.error.message;
            } else if (error.message) {
              userMessage = error.message;
            }
            observer.error(new Error(userMessage));
          }
        }
      });
    });
  }

  /**
   * Export farm overview report
   */
  exportFarmOverview(): Observable<void> {
    const url = `${this.apiUrl}/farms`;
    return this.downloadFile(url, 'farm-overview-report.xlsx');
  }

  /**
   * Export all irrigations
   */
  exportAllIrrigations(): Observable<void> {
    const url = `${this.apiUrl}/irrigations`;
    return this.downloadFile(url, 'irrigations-all.xlsx');
  }

  /**
   * Export irrigations for a specific farm
   * @param farmId The farm ID
   */
  exportIrrigationsByFarm(farmId: number): Observable<void> {
    const url = `${this.apiUrl}/irrigations/farm/${farmId}`;
    return this.downloadFile(url, `irrigations-farm-${farmId}.xlsx`);
  }

  /**
   * Export all fertilizations
   */
  exportAllFertilizations(): Observable<void> {
    const url = `${this.apiUrl}/fertilizations`;
    return this.downloadFile(url, 'fertilizations-all.xlsx');
  }

  /**
   * Export fertilizations for a specific farm
   * @param farmId The farm ID
   */
  exportFertilizationsByFarm(farmId: number): Observable<void> {
    const url = `${this.apiUrl}/fertilizations/farm/${farmId}`;
    return this.downloadFile(url, `fertilizations-farm-${farmId}.xlsx`);
  }

  /**
   * Export parcel activity report
   * @param parcelId The parcel ID
   */
  exportParcelActivity(parcelId: number): Observable<void> {
    const url = `${this.apiUrl}/parcel/${parcelId}`;
    return this.downloadFile(url, `parcel-${parcelId}-activity.xlsx`);
  }

  /**
   * Export crop management report
   */
  exportCropManagement(): Observable<void> {
    const url = `${this.apiUrl}/crops`;
    return this.downloadFile(url, 'crop-management-report.xlsx');
  }

  /**
   * Export complete farm report
   * @param farmId The farm ID
   */
  exportCompleteFarm(farmId: number): Observable<void> {
    const url = `${this.apiUrl}/farm/${farmId}`;
    return this.downloadFile(url, `farm-${farmId}-complete.xlsx`);
  }

  /**
   * Export parcel weather data
   * @param parcelId The parcel ID
   */
  exportParcelWeather(parcelId: number): Observable<void> {
    const url = `${this.apiUrl}/parcel/${parcelId}/weather`;
    return this.downloadFile(url, `parcel-${parcelId}-weather.xlsx`);
  }
}

