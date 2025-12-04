import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { FertilizationService } from '../../../../core/services/fertilization.service';
import { Fertilization } from '../../../../core/models/fertilization.model';
import { FertilizationStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-fertilizations-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './fertilizations-list.component.html',
  styleUrl: './fertilizations-list.component.scss'
})
export class FertilizationsListComponent implements OnInit {
  fertilizations: Fertilization[] = [];
  loading = true;
  displayedColumns: string[] = ['parcel', 'scheduledDatetime', 'fertilizerType', 'status', 'actions'];

  constructor(
    private fertilizationService: FertilizationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFertilizations();
  }

  loadFertilizations(): void {
    this.loading = true;
    this.fertilizationService.getAllFertilizations().subscribe({
      next: (fertilizations) => {
        this.fertilizations = fertilizations;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load fertilizations: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCreateFertilization(): void {
    this.router.navigate(['/dashboard/fertilizations/new']);
  }

  onViewFertilization(fertilization: Fertilization): void {
    this.router.navigate(['/dashboard/fertilizations', fertilization.id]);
  }

  onEditFertilization(fertilization: Fertilization, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/fertilizations', fertilization.id, 'edit']);
  }

  onDeleteFertilization(fertilization: Fertilization, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete this fertilization schedule?`)) {
      this.fertilizationService.deleteFertilization(fertilization.id).subscribe({
        next: () => {
          this.snackBar.open('Fertilization deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadFertilizations();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete fertilization: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatusClass(status: FertilizationStatus): string {
    const statusMap: { [key in FertilizationStatus]: string } = {
      [FertilizationStatus.SCHEDULED]: 'status-scheduled',
      [FertilizationStatus.PENDING]: 'status-pending',
      [FertilizationStatus.COMPLETED]: 'status-completed',
      [FertilizationStatus.CANCELLED]: 'status-cancelled'
    };
    return statusMap[status] || '';
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}

