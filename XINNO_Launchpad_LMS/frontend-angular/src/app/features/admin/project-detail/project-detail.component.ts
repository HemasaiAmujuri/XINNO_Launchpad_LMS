import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminProjectService } from '../../../core/services/admin-project.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  projectId = '';
  project: any = null;
  loading = false;
  error = '';
  
  // Stage review
  selectedStage: any = null;
  showReviewModal = false;
  reviewForm = {
    mentorRemarks: '',
    isApproved: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminProjectService: AdminProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadProject();
    }
  }

  loadProject(): void {
    this.loading = true;
    this.error = '';
    
    this.adminProjectService.getProjectById(this.projectId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.project = response.data;
        } else {
          this.error = response.message || 'Failed to load project';
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load project';
        this.loading = false;
      }
    });
  }

  openReviewModal(stage: any): void {
    this.selectedStage = stage;
    this.reviewForm = {
      mentorRemarks: stage.mentorRemarks || '',
      isApproved: stage.isApproved || false
    };
    this.showReviewModal = true;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.selectedStage = null;
    this.reviewForm = {
      mentorRemarks: '',
      isApproved: false
    };
  }

  submitReview(): void {
    if (!this.selectedStage) return;

    this.adminProjectService.reviewStage(
      this.projectId,
      this.selectedStage.stage,
      this.reviewForm
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('Review submitted successfully!');
          this.closeReviewModal();
          this.loadProject();
        } else {
          alert(response.message || 'Failed to submit review');
        }
      },
      error: (err: any) => {
        alert(err.error?.message || 'Failed to submit review');
      }
    });
  }

  deleteProject(): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.adminProjectService.deleteProject(this.projectId).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Project deleted successfully');
            this.router.navigate(['/admin/projects']);
          } else {
            alert(response.message || 'Failed to delete project');
          }
        },
        error: (err: any) => {
          alert(err.error?.message || 'Failed to delete project');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/projects']);
  }

  editProject(): void {
    this.router.navigate(['/admin/projects/edit', this.projectId]);
  }

  getStageDisplayName(stage: string): string {
    return stage.replace(/_/g, ' ');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
