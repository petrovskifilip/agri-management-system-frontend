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
import { FarmService } from '../../../../core/services/farm.service';
import { Farm } from '../../../../core/models/farm.model';

@Component({
  selector: 'app-farm-form',
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
  templateUrl: './farm-form.component.html',
  styleUrl: './farm-form.component.scss'
})
export class FarmFormComponent implements OnInit {
  farmForm: FormGroup;
  loading = false;
  isEditMode = false;
  farmId: number | null = null;
  pageTitle = 'Create New Farm';

  constructor(
    private fb: FormBuilder,
    private farmService: FarmService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.farmForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      location: ['', [Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.farmId = +params['id'];
        this.pageTitle = 'Edit Farm';
        this.loadFarm(this.farmId);
      }
    });
  }

  loadFarm(id: number): void {
    this.loading = true;
    this.farmService.getFarmById(id).subscribe({
      next: (farm: Farm) => {
        this.farmForm.patchValue({
          name: farm.name,
          location: farm.location || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load farm: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/farms']);
      }
    });
  }

  onSubmit(): void {
    if (this.farmForm.valid) {
      this.loading = true;
      const farmData = this.farmForm.value;

      const operation = this.isEditMode
        ? this.farmService.updateFarm(this.farmId!, farmData)
        : this.farmService.createFarm(farmData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Farm ${this.isEditMode ? 'updated' : 'created'} successfully!`,
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/dashboard/farms']);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open(
            `Failed to ${this.isEditMode ? 'update' : 'create'} farm: ` + (error.error?.message || 'Unknown error'),
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.farmForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/farms']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}

