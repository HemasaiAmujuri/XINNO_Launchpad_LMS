import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  // All authenticated routes use the main layout wrapper
  {
    path: '',
    loadComponent: () =>
      import('./shared/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'assessments',
        loadComponent: () =>
          import('./features/assessments/assessment-list/assessment-list.component').then(
            (m) => m.AssessmentListComponent
          ),
      },
      {
        path: 'assessments/:id/take',
        loadComponent: () =>
          import('./features/assessments/take-assessment/take-assessment.component').then(
            (m) => m.TakeAssessmentComponent
          ),
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./features/projects/project-list/project-list.component').then(
            (m) => m.ProjectListComponent
          ),
      },
      {
        path: 'projects/:id',
        loadComponent: () =>
          import('./features/projects/project-detail/project-detail.component').then(
            (m) => m.ProjectDetailComponent
          ),
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./features/feedback/feedback-list/feedback-list.component').then(
            (m) => m.FeedbackListComponent
          ),
      },
      {
        path: 'my-feedbacks',
        loadComponent: () =>
          import('./features/feedback/my-feedbacks/my-feedbacks.component').then(
            (m) => m.MyFeedbacksComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin-panel/admin-panel.component').then(
            (m) => m.AdminPanelComponent
          ),
      },
      {
        path: 'admin/questions',
        loadComponent: () =>
          import('./features/admin/question-management/question-management.component').then(
            (m) => m.QuestionManagementComponent
          ),
      },
      {
        path: 'admin/create-assessment',
        loadComponent: () =>
          import('./features/admin/create-assessment/create-assessment.component').then(
            (m) => m.CreateAssessmentComponent
          ),
      },
      {
        path: 'admin/edit-assessment/:id',
        loadComponent: () =>
          import('./features/admin/edit-assessment/edit-assessment.component').then(
            (m) => m.EditAssessmentComponent
          ),
      },
      {
        path: 'admin/submissions',
        loadComponent: () =>
          import('./features/admin/review-submissions/review-submissions.component').then(
            (m) => m.ReviewSubmissionsComponent
          ),
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./features/admin/users-management/users-management.component').then(
            (m) => m.UsersManagementComponent
          ),
      },
      {
        path: 'admin/projects',
        loadComponent: () =>
          import('./features/admin/project-management/project-management.component').then(
            (m) => m.ProjectManagementComponent
          ),
      },
      {
        path: 'admin/projects/create',
        loadComponent: () =>
          import('./features/admin/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: 'admin/projects/edit/:id',
        loadComponent: () =>
          import('./features/admin/project-form/project-form.component').then(
            (m) => m.ProjectFormComponent
          ),
      },
      {
        path: 'admin/projects/:id',
        loadComponent: () =>
          import('./features/admin/project-detail/project-detail.component').then(
            (m) => m.ProjectDetailComponent
          ),
      },
      {
        path: 'admin/feedback',
        loadComponent: () =>
          import('./features/admin/feedback-management/feedback-management.component').then(
            (m) => m.FeedbackManagementComponent
          ),
      },
      {
        path: 'admin/feedback/:id/submissions',
        loadComponent: () =>
          import('./features/admin/feedback-management/submissions/submissions.component').then(
            (m) => m.FeedbackSubmissionsComponent
          ),
      },
      {
        path: 'admin/feedback/:id/analytics',
        loadComponent: () =>
          import('./features/admin/feedback-management/analytics/analytics.component').then(
            (m) => m.FeedbackAnalyticsComponent
          ),
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
