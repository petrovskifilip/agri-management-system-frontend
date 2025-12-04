import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ParcelService } from '../../../../core/services/parcel.service';
import { Parcel, ParcelWeather } from '../../../../core/models/parcel.model';

@Component({
  selector: 'app-parcel-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './parcel-details.component.html',
  styleUrl: './parcel-details.component.scss'
})
export class ParcelDetailsComponent implements OnInit {
  parcel: Parcel | null = null;
  weather: ParcelWeather | null = null;
  loading = true;
  loadingWeather = false;
  parcelId!: number;

  constructor(
    private parcelService: ParcelService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.parcelId = +params['id'];
      this.loadParcel();
    });
  }

  loadParcel(): void {
    this.loading = true;
    this.parcelService.getParcelById(this.parcelId).subscribe({
      next: (parcel) => {
        this.parcel = parcel;
        this.loading = false;

        // Load weather if coordinates are available
        if (parcel.latitude && parcel.longitude) {
          this.loadWeather();
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load parcel: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/parcels']);
      }
    });
  }

  loadWeather(): void {
    this.loadingWeather = true;
    this.parcelService.getParcelWeather(this.parcelId).subscribe({
      next: (weather) => {
        this.weather = weather;
        this.loadingWeather = false;
      },
      error: (error) => {
        this.loadingWeather = false;
        console.error('Failed to load weather:', error);
        // Don't show error snackbar for weather, as it's optional
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/parcels', this.parcelId, 'edit']);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete parcel "${this.parcel?.name}"?`)) {
      this.parcelService.deleteParcel(this.parcelId).subscribe({
        next: () => {
          this.snackBar.open('Parcel deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/parcels']);
        },
        error: (error) => {
          this.snackBar.open('Failed to delete parcel: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/dashboard/parcels']);
  }

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hasWeatherData(): boolean {
    return this.weather !== null && !this.loadingWeather;
  }

  isRainExpected(): boolean {
    return this.weather !== null && this.weather.rainExpectedInOneHour > 0;
  }
}

