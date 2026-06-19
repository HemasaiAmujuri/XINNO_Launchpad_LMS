import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  assessments: any[] = [];
  loading = false;
  private authService = inject(AuthService);
  currentUser: any = null;

  get isTrainer(): boolean {
    return this.currentUser?.role === 'TRAINER';
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  adminCards = [
    {
      title: 'Question Bank',
      icon: '📝',
      description: 'Manage questions, create MCQ and descriptive questions',
      route: '/admin/questions',
      color: '#1976d2',
      stats: 'Add, Edit, Delete Questions',
      adminOnly: true  // Hide for trainers
    },
    {
      title: 'Create Assessment',
      icon: '📋',
      description: 'Create new assessments and assign to students',
      route: '/admin/create-assessment',
      color: '#4caf50',
      stats: 'Multi-step Assessment Builder',
      adminOnly: true  // Hide for trainers
    },
    {
      title: 'Review Submissions',
      icon: '✅',
      description: 'Evaluate student submissions and publish results',
      route: '/admin/submissions',
      color: '#ff9800',
      stats: 'Auto + Manual Evaluation',
      adminOnly: false  // Show for trainers
    },
    {
      title: 'Project Management',
      icon: '📊',
      description: 'Manage student projects, assign mentors & track progress',
      route: '/admin/projects',
      color: '#00bcd4',
      stats: 'Manage All Projects',
      adminOnly: false  // Show for trainers
    },
    {
      title: 'Users Management',
      icon: '👥',
      description: 'Manage students & trainers, create new trainer accounts',
      route: '/admin/users',
      color: '#9c27b0',
      stats: 'Students & Trainers',
      adminOnly: false  // Allow trainers to access for giving feedback
    }
  ];

  get filteredCards() {
    if (this.isAdmin) {
      return this.adminCards; // Show all cards for admin
    }
    return this.adminCards.filter(card => !card.adminOnly); // Filter for trainers
  }

  constructor(
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.loading = true;
    this.assessmentService.getAssessments().subscribe({
      next: (response) => {
        this.assessments = Array.isArray(response) ? response : (response.data || []);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading assessments:', err);
        this.loading = false;
      }
    });
  }

  editAssessment(assessmentId: string): void {
    this.router.navigate(['/admin/edit-assessment', assessmentId]);
  }
}
