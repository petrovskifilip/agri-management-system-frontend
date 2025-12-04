import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="coming-soon-container">
      <mat-card class="coming-soon-card">
        <mat-card-header>
          <mat-icon class="icon">construction</mat-icon>
        </mat-card-header>
        <mat-card-content>
          <h1>Coming Soon</h1>
          <p>This feature is currently under development.</p>
          <p>Please check back later.</p>
          <a mat-button routerLink="/dashboard">← Back to Dashboard</a>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 24px;
    }

    .coming-soon-card {
      max-width: 500px;
      text-align: center;

      mat-card-header {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
      }

      .icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #7cb342;
      }

      h1 {
        font-size: 2rem;
        color: #2d5016;
        margin-bottom: 16px;
      }

      p {
        color: #666;
        margin-bottom: 12px;
      }

      a {
        margin-top: 24px;
      }
    }
  `]
})
export class ComingSoonComponent {}

