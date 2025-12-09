import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FarmService } from '../../../../core/services/farm.service';
import { ExportService } from '../../../../core/services/export.service';
import { Farm } from '../../../../core/models/farm.model';

@Component({
  selector: 'app-farms-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './farms-list.component.html',
  styleUrl: './farms-list.component.scss'
})
export class FarmsListComponent implements OnInit {
  farms: Farm[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'location', 'parcelCount', 'createdAt', 'actions'];

  constructor(
    private farmService: FarmService,
    private exportService: ExportService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFarms();
  }

  loadFarms(): void {
    this.loading = true;
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load farms: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCreateFarm(): void {
    this.router.navigate(['/dashboard/farms/new']);
  }

  onViewFarm(farm: Farm): void {
    this.router.navigate(['/dashboard/farms', farm.id]);
  }

  onEditFarm(farm: Farm, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/farms', farm.id, 'edit']);
  }

  onDeleteFarm(farm: Farm, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete farm "${farm.name}"? This will also delete all associated parcels and their data.`)) {
      this.farmService.deleteFarm(farm.id).subscribe({
        next: () => {
          this.snackBar.open('Farm deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadFarms();
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onExportFarms(): void {
    this.exportService.exportFarmOverview().subscribe({
      next: () => {
        this.snackBar.open('Export completed successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error: any) => {
        console.error('Export error:', error);
        let errorMessage = 'Unknown error';

        if (error.message) {
          errorMessage = error.message;
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.statusText) {
          errorMessage = error.statusText;
        }

        this.snackBar.open('Failed to export farms: ' + errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}

