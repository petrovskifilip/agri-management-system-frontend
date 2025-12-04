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
import { MatTooltipModule } from '@angular/material/tooltip';
import { IrrigationService } from '../../../../core/services/irrigation.service';
import { Irrigation } from '../../../../core/models/irrigation.model';
import { IrrigationStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-irrigation-details',
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
    MatTooltipModule
  ],
  templateUrl: './irrigation-details.component.html',
  styleUrl: './irrigation-details.component.scss'
})
export class IrrigationDetailsComponent implements OnInit {
  irrigation: Irrigation | null = null;
  loading = true;
  irrigationId!: number;

  constructor(
    private irrigationService: IrrigationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.irrigationId = +params['id'];
      this.loadIrrigation();
    });
  }

  loadIrrigation(): void {
    this.loading = true;
    this.irrigationService.getIrrigationById(this.irrigationId).subscribe({
      next: (irrigation) => {
        this.irrigation = irrigation;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load irrigation: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/irrigation']);
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/irrigation', this.irrigationId, 'edit']);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete this irrigation schedule?`)) {
      this.irrigationService.deleteIrrigation(this.irrigationId).subscribe({
        next: () => {
          this.snackBar.open('Irrigation deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/irrigation']);
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

  onBack(): void {
    this.router.navigate(['/dashboard/irrigation']);
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

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canEdit(): boolean {
    return this.irrigation?.status !== IrrigationStatus.COMPLETED &&
           this.irrigation?.status !== IrrigationStatus.CANCELLED;
  }

  canDelete(): boolean {
    return this.irrigation?.status === IrrigationStatus.SCHEDULED;
  }

  canExecute(): boolean {
    return this.irrigation?.status === IrrigationStatus.SCHEDULED ||
           this.irrigation?.status === IrrigationStatus.RETRYING;
  }

  canStop(): boolean {
    return this.irrigation?.status === IrrigationStatus.IN_PROGRESS;
  }

  onExecute(): void {
    if (confirm('Execute this irrigation now? This will start the irrigation process immediately.')) {
      this.irrigationService.executeIrrigation(this.irrigationId).subscribe({
        next: (message) => {
          this.snackBar.open(message || 'Irrigation execution started successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Reload to see updated status
          this.loadIrrigation();
        },
        error: (error) => {
          this.snackBar.open('Failed to execute irrigation: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onStop(): void {
    if (confirm('Stop this irrigation? This will immediately stop the ongoing irrigation process.')) {
      this.irrigationService.stopIrrigation(this.irrigationId).subscribe({
        next: (message) => {
          this.snackBar.open(message || 'Irrigation stopped successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          // Reload to see updated status
          this.loadIrrigation();
        },
        error: (error) => {
          this.snackBar.open('Failed to stop irrigation: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

