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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { IrrigationService } from '../../../../core/services/irrigation.service';
import { ParcelService } from '../../../../core/services/parcel.service';
import { Irrigation } from '../../../../core/models/irrigation.model';
import { Parcel } from '../../../../core/models/parcel.model';
import { IrrigationStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-irrigation-form',
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
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './irrigation-form.component.html',
  styleUrl: './irrigation-form.component.scss'
})
export class IrrigationFormComponent implements OnInit {
  irrigationForm: FormGroup;
  loading = false;
  isEditMode = false;
  irrigationId: number | null = null;
  pageTitle = 'Schedule New Irrigation';

  parcels: Parcel[] = [];
  loadingParcels = true;

  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private irrigationService: IrrigationService,
    private parcelService: ParcelService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.irrigationForm = this.fb.group({
      parcelId: ['', [Validators.required]],
      scheduledDate: ['', [Validators.required]],
      scheduledTime: ['', [Validators.required]],
      durationMinutes: ['', [Validators.min(1)]],
      waterAmountLiters: ['', [Validators.min(0.01)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadParcels();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.irrigationId = +params['id'];
        this.pageTitle = 'Edit Irrigation';
        this.loadIrrigation(this.irrigationId);
      }
    });
  }

  loadParcels(): void {
    this.loadingParcels = true;
    this.parcelService.getAllParcels().subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        this.loadingParcels = false;
      },
      error: (error) => {
        this.loadingParcels = false;
        this.snackBar.open('Failed to load parcels: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadIrrigation(id: number): void {
    this.loading = true;
    this.irrigationService.getIrrigationById(id).subscribe({
      next: (irrigation: Irrigation) => {
        const scheduledDate = new Date(irrigation.scheduledDatetime);
        const timeString = scheduledDate.toTimeString().slice(0, 5); // HH:MM format

        this.irrigationForm.patchValue({
          parcelId: irrigation.parcelId,
          scheduledDate: scheduledDate,
          scheduledTime: timeString,
          durationMinutes: irrigation.durationMinutes || '',
          waterAmountLiters: irrigation.waterAmountLiters || '',
          description: irrigation.statusDescription || ''
        });
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

  onSubmit(): void {
    if (this.irrigationForm.valid) {
      this.loading = true;
      const irrigationData = this.prepareFormData();

      const operation = this.isEditMode
        ? this.irrigationService.updateIrrigation(this.irrigationId!, irrigationData)
        : this.irrigationService.createIrrigation(irrigationData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Irrigation ${this.isEditMode ? 'updated' : 'scheduled'} successfully!`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/dashboard/irrigation']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'schedule'} irrigation: ` + (error.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.irrigationForm);
    }
  }

  private prepareFormData(): any {
    const formValue = this.irrigationForm.value;

    // Combine date and time
    const date = new Date(formValue.scheduledDate);
    const [hours, minutes] = formValue.scheduledTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const data: any = {
      parcelId: +formValue.parcelId,
      scheduledDatetime: date.toISOString(),
      status: IrrigationStatus.SCHEDULED  // Always set to SCHEDULED by default
    };

    // Only include optional fields if they have values
    if (formValue.durationMinutes) {
      data.durationMinutes = +formValue.durationMinutes;
    }
    if (formValue.waterAmountLiters) {
      data.waterAmountLiters = +formValue.waterAmountLiters;
    }
    if (formValue.description) {
      data.statusDescription = formValue.description;
    }

    return data;
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/irrigation']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

