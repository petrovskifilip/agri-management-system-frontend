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
import { MatChipsModule } from '@angular/material/chips';
import { ParcelService } from '../../../../core/services/parcel.service';
import { Parcel } from '../../../../core/models/parcel.model';

@Component({
  selector: 'app-parcels-list',
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
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './parcels-list.component.html',
  styleUrl: './parcels-list.component.scss'
})
export class ParcelsListComponent implements OnInit {
  parcels: Parcel[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'farmName', 'cropName', 'area', 'lastIrrigated', 'actions'];

  constructor(
    private parcelService: ParcelService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadParcels();
  }

  loadParcels(): void {
    this.loading = true;
    this.parcelService.getAllParcels().subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load parcels: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCreateParcel(): void {
    this.router.navigate(['/dashboard/parcels/new']);
  }

  onViewParcel(parcel: Parcel): void {
    this.router.navigate(['/dashboard/parcels', parcel.id]);
  }

  onEditParcel(parcel: Parcel, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/parcels', parcel.id, 'edit']);
  }

  onDeleteParcel(parcel: Parcel, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete parcel "${parcel.name}"? This will also delete all associated irrigation and fertilization records.`)) {
      this.parcelService.deleteParcel(parcel.id).subscribe({
        next: () => {
          this.snackBar.open('Parcel deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadParcels();
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

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

