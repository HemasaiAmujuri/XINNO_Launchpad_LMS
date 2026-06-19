import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminFeedbackService } from '../../../../core/services/admin-feedback.service';

@Component({
  selector: 'app-feedback-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css']
})
export class FeedbackSubmissionsComponent implements OnInit {
  formId = '';
  formTitle = '';
  submissions: any[] = [];
  loading = false;
  error = '';
  
  // Review modal
  showReviewModal = false;
  selectedSubmission: any = null;
  reviewForm = {
    rating: 0,
    comments: ''
  };

  constructor(private route: ActivatedRoute, private adminFeedback: AdminFeedbackService) {}

  ngOnInit(): void {
    this.formId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.formId) {
      this.error = 'Invalid form id';
      return;
    }
    this.loadForm();
    this.loadSubmissions();
  }

  loadForm(): void {
    this.adminFeedback.getFeedbackForm(this.formId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.formTitle = res.data?.title || 'Feedback Form';
        }
      },
      error: (err: any) => {
        console.error('Error loading form:', err);
      }
    });
  }

  loadSubmissions(): void {
    this.loading = true;
    this.adminFeedback.getFormSubmissions(this.formId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.submissions = res.data;
        } else {
          this.error = res.message || 'Failed to load submissions';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load submissions';
        this.loading = false;
      }
    });
  }

  openReviewModal(submission: any): void {
    this.selectedSubmission = submission;
    this.reviewForm = {
      rating: 0,
      comments: ''
    };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedSubmission = null;
    this.reviewForm = {
      rating: 0,
      comments: ''
    };
  }

  submitReview(): void {
    if (!this.selectedSubmission || !this.reviewForm.rating) {
      alert('Please provide a rating');
      return;
    }

    this.adminFeedback.addSubmissionReview(
      this.selectedSubmission.id,
      this.reviewForm
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Review submitted successfully!');
          this.closeReviewModal();
          this.loadSubmissions();
        } else {
          alert(res.message || 'Failed to submit review');
        }
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to submit review');
      }
    });
  }

  setRating(rating: number): void {
    this.reviewForm.rating = rating;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

