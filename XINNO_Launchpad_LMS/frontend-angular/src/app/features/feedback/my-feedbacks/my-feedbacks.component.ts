import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserManagementService } from '../../../core/services/user-management.service';

interface Feedback {
  id: string;
  marks: number | null;
  maxMarks: number | null;
  comments: string;
  category: string;
  createdAt: string;
  giver: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-my-feedbacks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-feedbacks.component.html',
  styleUrl: './my-feedbacks.component.css'
})
export class MyFeedbacksComponent implements OnInit {
  feedbacks: Feedback[] = [];
  isLoading = false;
  error = '';
  currentUser: any = null;

  constructor(private userService: UserManagementService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadFeedbacks();
  }

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.error = '';

    const userId = this.currentUser?.id;
    
    this.userService.getMyFeedbacks(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.feedbacks = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading feedbacks:', error);
        this.error = 'Failed to load feedbacks';
        this.isLoading = false;
      }
    });
  }

  getCategoryBadgeClass(category: string): string {
    const classes: any = {
      'GENERAL': 'badge-general',
      'TECHNICAL': 'badge-technical',
      'BEHAVIOR': 'badge-behavior',
      'PERFORMANCE': 'badge-performance',
      'IMPROVEMENT': 'badge-improvement'
    };
    return classes[category] || 'badge-general';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
