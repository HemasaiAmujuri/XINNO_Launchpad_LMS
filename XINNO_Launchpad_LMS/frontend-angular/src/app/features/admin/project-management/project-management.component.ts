import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminProjectService } from '../../../core/services/admin-project.service';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.css'],
})
export class ProjectManagementComponent implements OnInit {
  projects: any[] = [];
  filteredProjects: any[] = [];
  students: any[] = [];
  mentors: any[] = [];
  loading = false;
  error = '';

  filters = {
    courseType: '',
    studentId: '',
    mentorId: '',
    stage: '',
    isCompleted: '',
  };

  courseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'];
  stages = [
    'PROBLEM_STATEMENT',
    'REQUIREMENT_ANALYSIS',
    'DESIGN_ARCHITECTURE',
    'DEVELOPMENT',
    'TESTING_VALIDATION',
    'DOCUMENTATION',
    'FINAL_DEMO_REVIEW',
  ];

  constructor(
    private adminProjectService: AdminProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadStudents();
    this.loadMentors();
  }

  loadProjects(): void {
    this.loading = true;
    this.error = '';

    const filterParams: any = {};
    if (this.filters.courseType) filterParams.courseType = this.filters.courseType;
    if (this.filters.studentId) filterParams.studentId = this.filters.studentId;
    if (this.filters.mentorId) filterParams.mentorId = this.filters.mentorId;
    if (this.filters.stage) filterParams.stage = this.filters.stage;
    if (this.filters.isCompleted) filterParams.isCompleted = this.filters.isCompleted === 'true';

    this.adminProjectService.getAllProjects(filterParams).subscribe({
      next: (response) => {
        if (response.success) {
          this.projects = response.data;
          this.filteredProjects = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load projects';
        this.loading = false;
      },
    });
  }

  loadStudents(): void {
    this.adminProjectService.getStudents().subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load students:', err);
      },
    });
  }

  loadMentors(): void {
    this.adminProjectService.getMentors().subscribe({
      next: (response) => {
        if (response.success) {
          this.mentors = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load mentors:', err);
      },
    });
  }

  applyFilters(): void {
    this.loadProjects();
  }

  clearFilters(): void {
    this.filters = {
      courseType: '',
      studentId: '',
      mentorId: '',
      stage: '',
      isCompleted: '',
    };
    this.loadProjects();
  }

  viewProject(projectId: string): void {
    this.router.navigate(['/admin/projects', projectId]);
  }

  editProject(projectId: string): void {
    this.router.navigate(['/admin/projects/edit', projectId]);
  }

  createProject(): void {
    this.router.navigate(['/admin/projects/create']);
  }

  deleteProject(projectId: string): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.adminProjectService.deleteProject(projectId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Project deleted successfully');
            this.loadProjects();
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete project');
        },
      });
    }
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
}
