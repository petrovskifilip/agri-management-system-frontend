import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { FarmService } from '../../../../core/services/farm.service';
import { ParcelService } from '../../../../core/services/parcel.service';
import { ExportService } from '../../../../core/services/export.service';
import { Farm } from '../../../../core/models/farm.model';
import { Parcel } from '../../../../core/models/parcel.model';

@Component({
  selector: 'app-farm-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule,
    MatDividerModule,
    MatMenuModule
  ],
  templateUrl: './farm-details.component.html',
  styleUrl: './farm-details.component.scss'
})
export class FarmDetailsComponent implements OnInit {
  farm: Farm | null = null;
  parcels: Parcel[] = [];
  loading = true;
  parcelsLoading = true;
  farmId: number | null = null;
  displayedColumns: string[] = ['name', 'size', 'crop', 'soilType', 'actions'];

  constructor(
    private farmService: FarmService,
    private parcelService: ParcelService,
    private exportService: ExportService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.farmId = +params['id'];
        this.loadFarm(this.farmId);
        this.loadParcels(this.farmId);
      }
    });
  }

  loadFarm(id: number): void {
    this.loading = true;
    this.farmService.getFarmById(id).subscribe({
      next: (farm) => {
        this.farm = farm;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load farm: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/farms']);
      }
    });
  }

  loadParcels(farmId: number): void {
    this.parcelsLoading = true;
    this.parcelService.getParcelsByFarm(farmId).subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        this.parcelsLoading = false;
      },
      error: (error) => {
        this.parcelsLoading = false;
        this.snackBar.open('Failed to load parcels: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/farms', this.farmId, 'edit']);
  }

  onDelete(): void {
    if (this.farm && confirm(`Are you sure you want to delete farm "${this.farm.name}"? This will also delete all associated parcels and their data.`)) {
      this.farmService.deleteFarm(this.farm.id).subscribe({
        next: () => {
          this.snackBar.open('Farm deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/farms']);
        },
        error: (error) => {
          this.snackBar.open('Failed to delete farm: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/dashboard/farms']);
  }

  onAddParcel(): void {
    this.router.navigate(['/dashboard/parcels/new'], {
      queryParams: { farmId: this.farmId }
    });
  }

  onViewParcel(parcel: Parcel): void {
    this.router.navigate(['/dashboard/parcels', parcel.id]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  onExportCompleteFarm(): void {
    if (this.farmId) {
      this.exportService.exportCompleteFarm(this.farmId).subscribe({
        next: () => {
          this.snackBar.open('Export completed successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Export error:', error);
          this.snackBar.open('Failed to export farm data: ' + (error.error?.message || error.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onExportFarmIrrigations(): void {
    if (this.farmId) {
      this.exportService.exportIrrigationsByFarm(this.farmId).subscribe({
        next: () => {
          this.snackBar.open('Export completed successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Export error:', error);
          this.snackBar.open('Failed to export irrigations: ' + (error.error?.message || error.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onExportFarmFertilizations(): void {
    if (this.farmId) {
      this.exportService.exportFertilizationsByFarm(this.farmId).subscribe({
        next: () => {
          this.snackBar.open('Export completed successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Export error:', error);
          this.snackBar.open('Failed to export fertilizations: ' + (error.error?.message || error.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

