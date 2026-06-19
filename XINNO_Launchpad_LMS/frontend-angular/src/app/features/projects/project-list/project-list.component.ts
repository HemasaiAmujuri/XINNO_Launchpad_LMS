import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService, Project } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  isLoading = false;
  error = '';
  userRole = '';
  Math = Math; // Make Math available in template

  stages = [
    { key: 'PROBLEM_STATEMENT', label: 'Problem Statement', icon: '🎯' },
    { key: 'REQUIREMENT_ANALYSIS', label: 'Requirement Analysis', icon: '📋' },
    { key: 'DESIGN_ARCHITECTURE', label: 'Design & Architecture', icon: '🎨' },
    { key: 'DEVELOPMENT', label: 'Development', icon: '💻' },
    { key: 'TESTING_VALIDATION', label: 'Testing & Validation', icon: '🧪' },
    { key: 'DOCUMENTATION', label: 'Documentation', icon: '📚' },
    { key: 'FINAL_DEMO_REVIEW', label: 'Final Demo & Review', icon: '🎬' }
  ];

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.error = '';
    
    const user = this.authService.getCurrentUser();
    const studentId = this.userRole === 'STUDENT' ? user?.id : undefined;
    
    this.projectService.getProjects(studentId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projects = response.data || [];
        } else {
          this.error = response.message || 'Failed to load projects';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load projects';
        this.isLoading = false;
      }
    });
  }

  getStageIcon(stage: string): string {
    const found = this.stages.find(s => s.key === stage);
    return found?.icon || '📌';
  }

  getStageLabel(stage: string): string {
    const found = this.stages.find(s => s.key === stage);
    return found?.label || stage;
  }

  getProgressColor(percent: number): string {
    if (percent < 30) return '#f44336';
    if (percent < 70) return '#ff9800';
    return '#4caf50';
  }

  getStageStatus(project: Project, stage: string): string {
    const progress = project.stageProgress?.find(sp => sp.stage === stage);
    return progress?.status || 'PENDING';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  viewProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
}
