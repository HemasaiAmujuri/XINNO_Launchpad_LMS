import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AdminFeedbackService } from '../../../../core/services/admin-feedback.service';

@Component({
  selector: 'app-feedback-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class FeedbackAnalyticsComponent implements OnInit {
  formId = '';
  analytics: any = null;
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private adminFeedback: AdminFeedbackService) {}

  ngOnInit(): void {
    this.formId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.formId) {
      this.error = 'Invalid form id';
      return;
    }
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.adminFeedback.getFormAnalytics(this.formId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.analytics = res.data;
        } else {
          this.error = res.message || 'Failed to load analytics';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load analytics';
        this.loading = false;
      }
    });
  }
}
