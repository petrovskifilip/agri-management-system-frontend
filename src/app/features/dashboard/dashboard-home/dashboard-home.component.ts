import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { FarmService } from '../../../core/services/farm.service';
import { ParcelService } from '../../../core/services/parcel.service';
import { IrrigationService } from '../../../core/services/irrigation.service';
import { FertilizationService } from '../../../core/services/fertilization.service';
import { AuthService } from '../../../core/services/auth.service';
import {FertilizationStatus} from '../../../core/models';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    StatsCardComponent
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  stats = {
    farms: { value: 0, loading: true },
    parcels: { value: 0, loading: true },
    irrigations: { value: 0, loading: true },
    fertilizations: { value: 0, loading: true }
  };

  constructor(
    private farmService: FarmService,
    private parcelService: ParcelService,
    private irrigationService: IrrigationService,
    private fertilizationService: FertilizationService,
    private authService: AuthService
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    // Load farms count
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.stats.farms.value = farms.length;
        this.stats.farms.loading = false;
      },
      error: () => {
        this.stats.farms.loading = false;
      }
    });

    // Load parcels count
    this.parcelService.getAllParcels().subscribe({
      next: (parcels) => {
        this.stats.parcels.value = parcels.length;
        this.stats.parcels.loading = false;
      },
      error: () => {
        this.stats.parcels.loading = false;
      }
    });

    // Load upcoming irrigations count
    this.irrigationService.getUpcomingIrrigations().subscribe({
      next: (irrigations) => {
        this.stats.irrigations.value = irrigations.length;
        this.stats.irrigations.loading = false;
      },
      error: () => {
        this.stats.irrigations.loading = false;
      }
    });

    // Load scheduled fertilizations count
    this.fertilizationService.getFertilizationsByStatus(FertilizationStatus.SCHEDULED).subscribe({
      next: (fertilizations) => {
        this.stats.fertilizations.value = fertilizations.length;
        this.stats.fertilizations.loading = false;
      },
      error: () => {
        this.stats.fertilizations.loading = false;
      }
    });
  }
}

