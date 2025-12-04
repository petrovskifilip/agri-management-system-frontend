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
import { CropService } from '../../../../core/services/crop.service';
import { Crop } from '../../../../core/models/crop.model';

@Component({
  selector: 'app-crop-details',
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
    MatChipsModule
  ],
  templateUrl: './crop-details.component.html',
  styleUrl: './crop-details.component.scss'
})
export class CropDetailsComponent implements OnInit {
  crop: Crop | null = null;
  loading = true;
  cropId!: number;

  constructor(
    private cropService: CropService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.cropId = +params['id'];
      this.loadCrop();
    });
  }

  loadCrop(): void {
    this.loading = true;
    this.cropService.getCropById(this.cropId).subscribe({
      next: (crop) => {
        this.crop = crop;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load crop: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/crops']);
      }
    });
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/crops', this.cropId, 'edit']);
  }

  onDelete(): void {
    if (confirm(`Are you sure you want to delete crop "${this.crop?.name}"?`)) {
      this.cropService.deleteCrop(this.cropId).subscribe({
        next: () => {
          this.snackBar.open('Crop deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/crops']);
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

  onBack(): void {
    this.router.navigate(['/dashboard/crops']);
  }
}

