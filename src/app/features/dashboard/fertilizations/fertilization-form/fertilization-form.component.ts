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
import { FertilizationService } from '../../../../core/services/fertilization.service';
import { ParcelService } from '../../../../core/services/parcel.service';
import { Fertilization } from '../../../../core/models/fertilization.model';
import { Parcel } from '../../../../core/models/parcel.model';
import { FertilizationStatus } from '../../../../core/models/enums';

@Component({
  selector: 'app-fertilization-form',
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
  templateUrl: './fertilization-form.component.html',
  styleUrl: './fertilization-form.component.scss'
})
export class FertilizationFormComponent implements OnInit {
  fertilizationForm: FormGroup;
  loading = false;
  isEditMode = false;
  fertilizationId: number | null = null;
  pageTitle = 'Schedule New Fertilization';

  parcels: Parcel[] = [];
  loadingParcels = true;

  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private fertilizationService: FertilizationService,
    private parcelService: ParcelService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.fertilizationForm = this.fb.group({
      parcelId: ['', [Validators.required]],
      scheduledDate: ['', [Validators.required]],
      scheduledTime: ['', [Validators.required]],
      fertilizerType: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadParcels();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.fertilizationId = +params['id'];
        this.pageTitle = 'Edit Fertilization';
        this.loadFertilization(this.fertilizationId);
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

  loadFertilization(id: number): void {
    this.loading = true;
    this.fertilizationService.getFertilizationById(id).subscribe({
      next: (fertilization: Fertilization) => {
        const scheduledDate = new Date(fertilization.scheduledDatetime);
        const timeString = scheduledDate.toTimeString().slice(0, 5);

        this.fertilizationForm.patchValue({
          parcelId: fertilization.parcelId,
          scheduledDate: scheduledDate,
          scheduledTime: timeString,
          fertilizerType: fertilization.fertilizerType || '',
          notes: fertilization.notes || ''
        });
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

  onSubmit(): void {
    if (this.fertilizationForm.valid) {
      this.loading = true;
      const fertilizationData = this.prepareFormData();

      const operation = this.isEditMode
        ? this.fertilizationService.updateFertilization(this.fertilizationId!, fertilizationData)
        : this.fertilizationService.createFertilization(fertilizationData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Fertilization ${this.isEditMode ? 'updated' : 'scheduled'} successfully!`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/dashboard/fertilizations']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'schedule'} fertilization: ` + (error.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.fertilizationForm);
    }
  }

  private prepareFormData(): any {
    const formValue = this.fertilizationForm.value;

    const date = new Date(formValue.scheduledDate);
    const [hours, minutes] = formValue.scheduledTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const data: any = {
      parcelId: +formValue.parcelId,
      scheduledDatetime: date.toISOString(),
      status: FertilizationStatus.SCHEDULED
    };

    if (formValue.fertilizerType) {
      data.fertilizerType = formValue.fertilizerType;
    }
    if (formValue.notes) {
      data.notes = formValue.notes;
    }

    return data;
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/fertilizations']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

