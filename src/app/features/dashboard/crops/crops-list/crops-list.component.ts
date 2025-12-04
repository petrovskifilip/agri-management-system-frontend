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
import { CropService } from '../../../../core/services/crop.service';
import { Crop } from '../../../../core/models/crop.model';

@Component({
  selector: 'app-crops-list',
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
  templateUrl: './crops-list.component.html',
  styleUrl: './crops-list.component.scss'
})
export class CropsListComponent implements OnInit {
  crops: Crop[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'irrigationFrequency', 'fertilizationFrequency', 'fertilizerType', 'actions'];

  constructor(
    private cropService: CropService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCrops();
  }

  loadCrops(): void {
    this.loading = true;
    this.cropService.getAllCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load crops: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCreateCrop(): void {
    this.router.navigate(['/dashboard/crops/new']);
  }

  onViewCrop(crop: Crop): void {
    this.router.navigate(['/dashboard/crops', crop.id]);
  }

  onEditCrop(crop: Crop, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/dashboard/crops', crop.id, 'edit']);
  }

  onDeleteCrop(crop: Crop, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete crop "${crop.name}"?`)) {
      this.cropService.deleteCrop(crop.id).subscribe({
        next: () => {
          this.snackBar.open('Crop deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCrops();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete crop: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}

