import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminFeedbackService } from '../../../core/services/admin-feedback.service';

@Component({
  selector: 'app-feedback-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-management.component.html',
  styleUrls: ['./feedback-management.component.css'],
})
export class FeedbackManagementComponent implements OnInit {
  forms: any[] = [];
  loading = false;
  error = '';
  showCreateModal = false;

  filters = {
    forRole: '',
    courseType: '',
    isActive: '',
  };

  roles = ['STUDENT', 'TRAINER', 'ADMIN'];
  courseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'];

  newForm = {
    title: '',
    description: '',
    forRole: 'STUDENT',
    courseType: '',
    isActive: true,
    questions: [
      {
        questionText: '',
        questionType: 'TEXT',
        isRequired: true,
        options: null,
      },
    ],
  };

  constructor(
    private adminFeedbackService: AdminFeedbackService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.loading = true;
    this.error = '';

    const filterParams: any = {};
    if (this.filters.forRole) filterParams.forRole = this.filters.forRole;
    if (this.filters.courseType) filterParams.courseType = this.filters.courseType;
    if (this.filters.isActive) filterParams.isActive = this.filters.isActive === 'true';

    this.adminFeedbackService.getAllForms(filterParams).subscribe({
      next: (response) => {
        if (response.success) {
          this.forms = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load feedback forms';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.loadForms();
  }

  clearFilters(): void {
    this.filters = {
      forRole: '',
      courseType: '',
      isActive: '',
    };
    this.loadForms();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newForm = {
      title: '',
      description: '',
      forRole: 'STUDENT',
      courseType: '',
      isActive: true,
      questions: [
        {
          questionText: '',
          questionType: 'TEXT',
          isRequired: true,
          options: null,
        },
      ],
    };
  }

  addQuestion(): void {
    this.newForm.questions.push({
      questionText: '',
      questionType: 'TEXT',
      isRequired: true,
      options: null,
    });
  }

  removeQuestion(index: number): void {
    if (this.newForm.questions.length > 1) {
      this.newForm.questions.splice(index, 1);
    }
  }

  createForm(): void {
    if (!this.newForm.title || this.newForm.questions.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const validQuestions = this.newForm.questions.filter(q => q.questionText.trim());
    if (validQuestions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    this.adminFeedbackService.createForm({
      ...this.newForm,
      questions: validQuestions,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Feedback form created successfully');
          this.closeCreateModal();
          this.loadForms();
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create feedback form');
      },
    });
  }

  viewSubmissions(formId: string): void {
    this.router.navigate(['/admin/feedback', formId, 'submissions']);
  }

  viewAnalytics(formId: string): void {
    this.router.navigate(['/admin/feedback', formId, 'analytics']);
  }

  toggleFormStatus(form: any): void {
    this.adminFeedbackService.updateForm(form.id, {
      isActive: !form.isActive,
    }).subscribe({
      next: (response) => {
        if (response.success) {
          form.isActive = !form.isActive;
          alert(`Form ${form.isActive ? 'activated' : 'deactivated'} successfully`);
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update form status');
      },
    });
  }

  deleteForm(formId: string): void {
    if (confirm('Are you sure you want to delete this feedback form?')) {
      this.adminFeedbackService.deleteForm(formId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Feedback form deleted successfully');
            this.loadForms();
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete feedback form');
        },
      });
    }
  }
}
