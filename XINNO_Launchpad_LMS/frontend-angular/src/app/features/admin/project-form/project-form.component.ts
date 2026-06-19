import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminProjectService } from '../../../core/services/admin-project.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit {
  projectId = '';
  isEditMode = false;
  loading = false;
  error = '';
  
  students: any[] = [];
  mentors: any[] = [];
  
  formData = {
    title: '',
    description: '',
    studentId: '',
    mentorId: '',
    courseType: '',
    startDate: '',
    endDate: ''
  };

  courseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminProjectService: AdminProjectService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    this.isEditMode = !!this.projectId;
    
    this.loadStudents();
    this.loadMentors();
    
    if (this.isEditMode) {
      this.loadProject();
    }
  }

  loadProject(): void {
    this.loading = true;
    this.adminProjectService.getProjectById(this.projectId).subscribe({
      next: (response: any) => {
        if (response.success) {
          const project = response.data;
          this.formData = {
            title: project.title,
            description: project.description,
            studentId: project.studentId,
            mentorId: project.mentorId || '',
            courseType: project.courseType,
            startDate: project.startDate?.split('T')[0] || '',
            endDate: project.endDate?.split('T')[0] || ''
          };
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load project';
        this.loading = false;
      }
    });
  }

  loadStudents(): void {
    this.adminProjectService.getStudents().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.students = response.data;
        }
      },
      error: (err: any) => {
        console.error('Failed to load students:', err);
      }
    });
  }

  loadMentors(): void {
    this.adminProjectService.getMentors().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.mentors = response.data;
        }
      },
      error: (err: any) => {
        console.error('Failed to load mentors:', err);
      }
    });
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = ''; // Clear previous errors
    
    const operation = this.isEditMode
      ? this.adminProjectService.updateProject(this.projectId, this.formData)
      : this.adminProjectService.createProject(this.formData);

    operation.subscribe({
      next: (response: any) => {
        if (response.success) {
          alert(`Project ${this.isEditMode ? 'updated' : 'created'} successfully!`);
          this.router.navigate(['/admin/projects']);
        } else {
          this.error = response.message || response.error || 'Operation failed';
        }
        this.loading = false;
      },
      error: (err: any) => {
        // Extract error message from response
        this.error = err.error?.error || err.error?.message || err.message || 'Operation failed';
        this.loading = false;
        console.error('Project operation error:', err);
      }
    });
  }

  validateForm(): boolean {
    if (!this.formData.title || !this.formData.description || !this.formData.studentId ||
        !this.formData.courseType || !this.formData.startDate || !this.formData.endDate) {
      alert('Please fill all required fields');
      return false;
    }
    return true;
  }

  cancel(): void {
    this.router.navigate(['/admin/projects']);
  }
}
