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
import { FertilizationService } from '../../../../core/services/fertilization.service';
import { Fertilization } from '../../../../core/models/fertilization.model';
import { FertilizationStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-fertilization-details',
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
  templateUrl: './fertilization-details.component.html',
  styleUrl: './fertilization-details.component.scss'
})
export class FertilizationDetailsComponent implements OnInit {
  fertilization: Fertilization | null = null;
  loading = true;
  fertilizationId!: number;

  constructor(
    private fertilizationService: FertilizationService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.fertilizationId = +params['id'];
      this.loadFertilization();
    });
  }

  loadFertilization(): void {
    this.loading = true;
    this.fertilizationService.getFertilizationById(this.fertilizationId).subscribe({
      next: (fertilization) => {
        this.fertilization = fertilization;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load fertilization: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/fertilizations']);
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/fertilizations', this.fertilizationId, 'edit']);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete this fertilization schedule?`)) {
      this.fertilizationService.deleteFertilization(this.fertilizationId).subscribe({
        next: () => {
          this.snackBar.open('Fertilization deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/fertilizations']);
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

  onComplete(): void {
    if (confirm('Mark this fertilization as completed?')) {
      this.fertilizationService.completeFertilization(this.fertilizationId).subscribe({
        next: () => {
          this.snackBar.open('Fertilization marked as completed', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadFertilization();
        },
        error: (error) => {
          this.snackBar.open('Failed to complete fertilization: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onCancel(): void {
    if (confirm('Cancel this fertilization?')) {
      this.fertilizationService.cancelFertilization(this.fertilizationId).subscribe({
        next: () => {
          this.snackBar.open('Fertilization cancelled', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadFertilization();
        },
        error: (error) => {
          this.snackBar.open('Failed to cancel fertilization: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/dashboard/fertilizations']);
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

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  canEdit(): boolean {
    return this.fertilization?.status !== FertilizationStatus.COMPLETED &&
           this.fertilization?.status !== FertilizationStatus.CANCELLED;
  }

  canDelete(): boolean {
    return this.fertilization?.status === FertilizationStatus.SCHEDULED;
  }

  canComplete(): boolean {
    return this.fertilization?.status === FertilizationStatus.SCHEDULED ||
           this.fertilization?.status === FertilizationStatus.PENDING;
  }

  canCancelAction(): boolean {
    return this.fertilization?.status !== FertilizationStatus.COMPLETED &&
           this.fertilization?.status !== FertilizationStatus.CANCELLED;
  }
}

