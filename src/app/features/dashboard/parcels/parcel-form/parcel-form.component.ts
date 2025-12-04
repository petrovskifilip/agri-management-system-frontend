import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ParcelService } from '../../../../core/services/parcel.service';
import { FarmService } from '../../../../core/services/farm.service';
import { CropService } from '../../../../core/services/crop.service';
import { Parcel } from '../../../../core/models/parcel.model';
import { Farm } from '../../../../core/models/farm.model';
import { Crop } from '../../../../core/models/crop.model';

@Component({
  selector: 'app-parcel-form',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './parcel-form.component.html',
  styleUrl: './parcel-form.component.scss'
})
export class ParcelFormComponent implements OnInit {
  parcelForm: FormGroup;
  loading = false;
  isEditMode = false;
  parcelId: number | null = null;
  pageTitle = 'Add New Parcel';

  farms: Farm[] = [];
  crops: Crop[] = [];
  loadingFarms = true;
  loadingCrops = true;

  constructor(
    private fb: FormBuilder,
    private parcelService: ParcelService,
    private farmService: FarmService,
    private cropService: CropService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.parcelForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      farmId: ['', [Validators.required]],
      cropId: [''],
      latitude: [''],
      longitude: [''],
      area: ['', [Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.loadFarms();
    this.loadCrops();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.parcelId = +params['id'];
        this.pageTitle = 'Edit Parcel';
        this.loadParcel(this.parcelId);
      }
    });
  }

  loadFarms(): void {
    this.loadingFarms = true;
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
        this.loadingFarms = false;
      },
      error: (error) => {
        this.loadingFarms = false;
        this.snackBar.open('Failed to load farms: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadCrops(): void {
    this.loadingCrops = true;
    this.cropService.getAllCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
        this.loadingCrops = false;
      },
      error: (error) => {
        this.loadingCrops = false;
        this.snackBar.open('Failed to load crops: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadParcel(id: number): void {
    this.loading = true;
    this.parcelService.getParcelById(id).subscribe({
      next: (parcel: Parcel) => {
        this.parcelForm.patchValue({
          name: parcel.name,
          farmId: parcel.farmId,
          cropId: parcel.cropId || '',
          latitude: parcel.latitude || '',
          longitude: parcel.longitude || '',
          area: parcel.area || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load parcel: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/parcels']);
      }
    });
  }

  onSubmit(): void {
    if (this.parcelForm.valid) {
      this.loading = true;
      const parcelData = this.prepareFormData();

      const operation = this.isEditMode
        ? this.parcelService.updateParcel(this.parcelId!, parcelData)
        : this.parcelService.createParcel(parcelData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Parcel ${this.isEditMode ? 'updated' : 'created'} successfully!`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/dashboard/parcels']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'create'} parcel: ` + (error.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.parcelForm);
    }
  }

  private prepareFormData(): any {
    const formValue = this.parcelForm.value;
    const data: any = {
      name: formValue.name,
      farmId: +formValue.farmId
    };

    // Only include optional fields if they have values
    if (formValue.cropId) {
      data.cropId = +formValue.cropId;
    }
    if (formValue.latitude) {
      data.latitude = +formValue.latitude;
    }
    if (formValue.longitude) {
      data.longitude = +formValue.longitude;
    }
    if (formValue.area) {
      data.area = +formValue.area;
    }

    return data;
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/parcels']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

