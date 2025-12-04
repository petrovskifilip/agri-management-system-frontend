import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CropService } from '../../../../core/services/crop.service';
import { Crop } from '../../../../core/models/crop.model';

@Component({
  selector: 'app-crop-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './crop-form.component.html',
  styleUrl: './crop-form.component.scss'
})
export class CropFormComponent implements OnInit {
  cropForm: FormGroup;
  loading = false;
  isEditMode = false;
  cropId: number | null = null;
  pageTitle = 'Add New Crop';

  constructor(
    private fb: FormBuilder,
    private cropService: CropService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.cropForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      irrigationFrequencyDays: ['', [Validators.min(1)]],
      fertilizationFrequencyDays: ['', [Validators.min(1)]],
      fertilizerType: ['', [Validators.maxLength(100)]],
      irrigationDurationMinutes: ['', [Validators.min(1)]],
      waterRequirementLitersPerSqm: ['', [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.cropId = +params['id'];
        this.pageTitle = 'Edit Crop';
        this.loadCrop(this.cropId);
      }
    });
  }

  loadCrop(id: number): void {
    this.loading = true;
    this.cropService.getCropById(id).subscribe({
      next: (crop: Crop) => {
        this.cropForm.patchValue({
          name: crop.name,
          irrigationFrequencyDays: crop.irrigationFrequencyDays || '',
          fertilizationFrequencyDays: crop.fertilizationFrequencyDays || '',
          fertilizerType: crop.fertilizerType || '',
          irrigationDurationMinutes: crop.irrigationDurationMinutes || '',
          waterRequirementLitersPerSqm: crop.waterRequirementLitersPerSqm || ''
        });
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

  onSubmit(): void {
    if (this.cropForm.valid) {
      this.loading = true;
      const cropData = this.prepareFormData();

      const operation = this.isEditMode
        ? this.cropService.updateCrop(this.cropId!, cropData)
        : this.cropService.createCrop(cropData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Crop ${this.isEditMode ? 'updated' : 'created'} successfully!`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/dashboard/crops']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'create'} crop: ` + (error.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.cropForm);
    }
  }

  private prepareFormData(): any {
    const formValue = this.cropForm.value;
    const data: any = {
      name: formValue.name
    };

    // Only include optional fields if they have values
    if (formValue.irrigationFrequencyDays) {
      data.irrigationFrequencyDays = +formValue.irrigationFrequencyDays;
    }
    if (formValue.fertilizationFrequencyDays) {
      data.fertilizationFrequencyDays = +formValue.fertilizationFrequencyDays;
    }
    if (formValue.fertilizerType) {
      data.fertilizerType = formValue.fertilizerType;
    }
    if (formValue.irrigationDurationMinutes) {
      data.irrigationDurationMinutes = +formValue.irrigationDurationMinutes;
    }
    if (formValue.waterRequirementLitersPerSqm) {
      data.waterRequirementLitersPerSqm = +formValue.waterRequirementLitersPerSqm;
    }

    return data;
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/crops']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

