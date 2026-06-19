import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h1>Feedback Forms</h1>
      <p>Feedback forms will be displayed here</p>
      <a routerLink="/dashboard" class="btn btn-secondary">Back to Dashboard</a>
    </div>
  `
})
export class FeedbackListComponent {}
