import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  sidenavOpened = true;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Farms', icon: 'agriculture', route: '/dashboard/farms' },
    { label: 'Crops', icon: 'eco', route: '/dashboard/crops' },
    { label: 'Parcels', icon: 'landscape', route: '/dashboard/parcels' },
    { label: 'Irrigation', icon: 'water_drop', route: '/dashboard/irrigation' },
    { label: 'Fertilization', icon: 'grass', route: '/dashboard/fertilization' },
    { label: 'User Management', icon: 'people', route: '/dashboard/admin/users', adminOnly: true }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter(item =>
      !item.adminOnly || this.currentUser()?.role === 'ADMIN'
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }
}

