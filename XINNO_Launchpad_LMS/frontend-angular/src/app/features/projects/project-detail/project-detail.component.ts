import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService, Project, StageProgress } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  timeline: any[] = [];
  isLoading = false;
  error = '';
  success = '';
  showUpdateModal = false;
  showUploadModal = false;
  userRole = '';
  selectedFile: File | null = null;
  uploadProgress = 0;
  
  updateForm!: FormGroup;
  uploadForm!: FormGroup;
  selectedStageKey = '';
  selectedStage: StageProgress | null = null;
  
  stages = [
    { key: 'PROBLEM_STATEMENT', label: 'Problem Statement', icon: '🎯', order: 1, description: 'Define the problem statement and objectives' },
    { key: 'REQUIREMENT_ANALYSIS', label: 'Requirement Analysis', icon: '📋', order: 2, description: 'Analyze and document requirements' },
    { key: 'DESIGN_ARCHITECTURE', label: 'Design & Architecture', icon: '🎨', order: 3, description: 'Design system architecture' },
    { key: 'DEVELOPMENT', label: 'Development', icon: '💻', order: 4, description: 'Implement the solution' },
    { key: 'TESTING_VALIDATION', label: 'Testing & Validation', icon: '🧪', order: 5, description: 'Test and validate the solution' },
    { key: 'DOCUMENTATION', label: 'Documentation', icon: '📚', order: 6, description: 'Create comprehensive documentation' },
    { key: 'FINAL_DEMO_REVIEW', label: 'Final Demo & Review', icon: '🎬', order: 7, description: 'Final demonstration and review' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private projectService: ProjectService,
    private authService: AuthService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
    
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  initForm(): void {
    this.updateForm = this.fb.group({
      status: ['IN_PROGRESS', Validators.required],
      studentNotes: ['', [Validators.required, Validators.minLength(10)]],
      mentorRemarks: ['']
    });

    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      stage: [''],
      file: [null, Validators.required]
    });
  }

  loadProject(projectId: string): void {
    this.isLoading = true;
    this.error = '';
    
    this.projectService.getProjectById(projectId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.project = response.data;
        } else {
          this.error = response.message || 'Failed to load project';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load project';
        this.isLoading = false;
      }
    });
  }

  getStageInfo(stageKey: string) {
    return this.stages.find(s => s.key === stageKey);
  }

  getStageProgress(stageKey: string): StageProgress | undefined {
    return this.project?.stageProgress?.find(sp => sp.stage === stageKey);
  }

  getStageStatus(stageKey: string): string {
    const progress = this.getStageProgress(stageKey);
    return progress?.status || 'PENDING';
  }

  isStageActive(stageKey: string): boolean {
    return this.project?.currentStage === stageKey;
  }

  openUpdateModal(stageKey: string): void {
    const progress = this.getStageProgress(stageKey);
    this.selectedStage = progress || null;
    
    this.updateForm.patchValue({
      status: progress?.status || 'IN_PROGRESS',
      studentNotes: progress?.studentNotes || '',
      mentorRemarks: progress?.mentorRemarks || ''
    });
    
    this.showUpdateModal = true;
  }

  closeModal(): void {
    this.showUpdateModal = false;
    this.selectedStage = null;
    this.error = '';
    this.success = '';
  }

  updateStage(): void {
    if (this.updateForm.invalid || !this.project || !this.selectedStage) {
      this.error = 'Please fill all required fields';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    const formData = this.updateForm.value;
    const updateData = {
      stage: this.selectedStage.stage,
      status: formData.status,
      studentNotes: formData.studentNotes,
      mentorRemarks: formData.mentorRemarks
    };
    
    this.projectService.updateStage(this.project.id, updateData).subscribe({
      next: () => {
        this.success = 'Stage updated successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.closeModal();
          if (this.project) {
            this.loadProject(this.project.id);
          }
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update stage';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getProgressColor(percent: number): string {
    if (percent < 30) return '#f44336';
    if (percent < 70) return '#ff9800';
    return '#4caf50';
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  // File Upload Methods
  openUploadModal(stageKey?: string): void {
    this.uploadForm.patchValue({
      title: '',
      stage: stageKey || '',
      file: null
    });
    this.selectedFile = null;
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.uploadProgress = 0;
    this.error = '';
    this.success = '';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (100MB max)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        this.error = 'File size exceeds 100MB limit';
        return;
      }

      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file });
      
      // Auto-fill title if empty
      if (!this.uploadForm.get('title')?.value) {
        this.uploadForm.patchValue({ title: file.name });
      }
      
      this.error = '';
    }
  }

  getFileIcon(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'].includes(ext)) return '🎥';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📽️';
    if (['zip', 'rar', '7z'].includes(ext)) return '📦';
    if (['js', 'ts', 'py', 'java'].includes(ext)) return '💻';
    
    return '📁';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  uploadDocument(): void {
    if (this.uploadForm.invalid || !this.selectedFile || !this.project) {
      this.error = 'Please fill all required fields and select a file';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('stage', this.uploadForm.get('stage')?.value || '');

    this.projectService.uploadDocument(this.project.id, formData).subscribe({
      next: (response: any) => {
        this.success = 'File uploaded successfully!';
        this.uploadProgress = 100;
        this.isLoading = false;
        setTimeout(() => {
          this.closeUploadModal();
          if (this.project) {
            this.loadProject(this.project.id);
          }
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to upload file';
        this.isLoading = false;
        this.uploadProgress = 0;
      }
    });
  }

  deleteDocument(documentId: string): void {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    // Implement delete document API call
    console.log('Delete document:', documentId);
  }
}
