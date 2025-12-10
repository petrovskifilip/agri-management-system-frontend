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
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { Role } from '../../../../core/models/enums';

@Component({
  selector: 'app-user-details',
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
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  loading = true;
  userId!: number;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = +params['id'];
      this.loadUser();
    });
  }

  loadUser(): void {
    this.loading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load user: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/dashboard/admin/users']);
      }
    });
  }

  onToggleEnabled(): void {
    if (this.user?.role === Role.ADMIN && this.user?.enabled) {
      this.snackBar.open('Cannot disable admin users', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const action = this.user?.enabled ? 'disable' : 'enable';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.userService.toggleUserEnabled(this.userId).subscribe({
        next: () => {
          this.snackBar.open(`User ${action}d successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUser();
        },
        error: (error) => {
          this.snackBar.open(`Failed to ${action} user: ` + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  canToggleEnabled(): boolean {
    // Can enable any disabled user, but can only disable non-admin users
    if (!this.user?.enabled) return true;
    return this.user?.role !== Role.ADMIN;
  }

  canDelete(): boolean {
    if (!this.user) return false;

    const currentUser = this.authService.currentUser();

    // Cannot delete yourself
    if (currentUser && this.user.id === currentUser.id) {
      return false;
    }

    // Cannot delete admin users
    if (this.user.role === Role.ADMIN) {
      return false;
    }

    return true;
  }

  getDeleteTooltip(): string {
    if (!this.user) return '';

    const currentUser = this.authService.currentUser();

    if (currentUser && this.user.id === currentUser.id) {
      return 'Cannot delete your own account';
    }

    if (this.user.role === Role.ADMIN) {
      return 'Cannot delete admin users';
    }

    return 'Delete User';
  }

  onDelete(): void {
    if (!this.canDelete()) {
      const currentUser = this.authService.currentUser();
      let message = 'Cannot delete this user';

      if (currentUser && this.user?.id === currentUser.id) {
        message = 'You cannot delete your own account';
      } else if (this.user?.role === Role.ADMIN) {
        message = 'Cannot delete admin users';
      }

      this.snackBar.open(message, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      this.userService.deleteUser(this.userId).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/dashboard/admin/users']);
        },
        error: (error) => {
          this.snackBar.open('Failed to delete user: ' + (error.error?.message || 'Unknown error'), 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/dashboard/admin/users']);
  }

  getRoleClass(role: Role): string {
    const roleMap: { [key in Role]: string } = {
      [Role.ADMIN]: 'role-admin',
      [Role.MANAGER]: 'role-manager'
    };
    return roleMap[role] || '';
  }

  formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`;
  }
}

