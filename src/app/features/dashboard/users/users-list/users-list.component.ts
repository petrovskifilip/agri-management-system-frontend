import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { Role } from '../../../../core/models/enums';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  loading = true;
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Failed to load users: ' + (error.error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onViewUser(user: User): void {
    this.router.navigate(['/dashboard/admin/users', user.id]);
  }

  onToggleEnabled(user: User, event: Event): void {
    event.stopPropagation();

    if (user.role === Role.ADMIN && user.enabled) {
      this.snackBar.open('Cannot disable admin users', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const action = user.enabled ? 'disable' : 'enable';
    if (confirm(`Are you sure you want to ${action} user ${user.firstName} ${user.lastName}?`)) {
      this.userService.toggleUserEnabled(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${action}d successfully`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
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

  canToggleEnabled(user: User): boolean {
    // Can enable any disabled user, but can only disable non-admin users
    if (!user.enabled) return true;
    return user.role !== Role.ADMIN;
  }

  onDeleteUser(user: User, event: Event): void {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadUsers();
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

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }
}

