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
import { IrrigationService } from '../../../../core/services/irrigation.service';
import { Irrigation } from '../../../../core/models/irrigation.model';
import { IrrigationStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-irrigations-list',
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
  templateUrl: './irrigations-list.component.html',
  styleUrl: './irrigations-list.component.scss'
})
export class IrrigationsListComponent implements OnInit {
  irrigations: Irrigation[] = [];
  loading = true;
  displayedColumns: string[] = ['parcel', 'scheduledDatetime', 'duration', 'waterAmount', 'status', 'actions'];

  constructor(
    private irrigationService: IrrigationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadIrrigations();
  }

  loadIrrigations(): void {
    this.loading = true;
    this.irrigationService.getAllIrrigations().subscribe({
      next: (irrigations) => {
        this.irrigations = irrigations;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load irrigations: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCreateIrrigation(): void {
    this.router.navigate(['/dashboard/irrigation/new']);
  }

  onViewIrrigation(irrigation: Irrigation): void {
    this.router.navigate(['/dashboard/irrigation', irrigation.id]);
  }

  onEditIrrigation(irrigation: Irrigation, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/irrigation', irrigation.id, 'edit']);
  }

  onDeleteIrrigation(irrigation: Irrigation, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete this irrigation schedule?`)) {
      this.irrigationService.deleteIrrigation(irrigation.id).subscribe({
        next: () => {
          this.snackBar.open('Irrigation deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadIrrigations();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete irrigation: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatusClass(status: IrrigationStatus): string {
    const statusMap: { [key in IrrigationStatus]: string } = {
      [IrrigationStatus.SCHEDULED]: 'status-scheduled',
      [IrrigationStatus.IN_PROGRESS]: 'status-in-progress',
      [IrrigationStatus.COMPLETED]: 'status-completed',
      [IrrigationStatus.CANCELLED]: 'status-cancelled',
      [IrrigationStatus.FAILED]: 'status-failed',
      [IrrigationStatus.RETRYING]: 'status-retrying',
      [IrrigationStatus.STOPPED]: 'status-stopped'
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
}

