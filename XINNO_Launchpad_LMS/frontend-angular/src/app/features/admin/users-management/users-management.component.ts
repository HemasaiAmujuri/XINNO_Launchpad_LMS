import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserManagementService, User, CreateTrainerRequest } from '../../../core/services/user-management.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.css'
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = false;
  error = '';
  success = '';
  private authService = inject(AuthService);
  
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }
  
  get isTrainer(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'TRAINER';
  }
  
  // Filters
  selectedRole = 'ALL';
  selectedBatch = 'ALL';
  searchQuery = '';
  
  // Create Trainer Modal
  showCreateModal = false;
  newTrainer: CreateTrainerRequest = {
    name: '',
    email: '',
    password: '',
    courseType: '',
    courseLevel: ''
  };

  constructor(
    private userService: UserManagementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = '';
    
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        this.users = Array.isArray(data) ? data : [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.error = err.error?.message || 'Failed to load users';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Role filter
      if (this.selectedRole !== 'ALL' && user.role !== this.selectedRole) {
        return false;
      }
      
      // Batch filter
      if (this.selectedBatch !== 'ALL' && user.batchName !== this.selectedBatch) {
        return false;
      }
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) || 
               user.email.toLowerCase().includes(query);
      }
      
      return true;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  get uniqueBatches(): string[] {
    const batches = this.users
      .map(u => u.batchName)
      .filter((batch): batch is string => !!batch);
    return Array.from(new Set(batches)).sort();
  }

  get studentCount(): number {
    return this.users.filter(u => u.role === 'STUDENT').length;
  }

  get trainerCount(): number {
    return this.users.filter(u => u.role === 'TRAINER').length;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newTrainer = {
      name: '',
      email: '',
      password: '',
      courseType: '',
      courseLevel: ''
    };
    this.error = '';
    this.success = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.newTrainer = {
      name: '',
      email: '',
      password: '',
      courseType: '',
      courseLevel: ''
    };
  }

  createTrainer(): void {
    // Validate
    if (!this.newTrainer.name || !this.newTrainer.email || !this.newTrainer.password) {
      this.error = 'Name, email, and password are required';
      return;
    }

    if (this.newTrainer.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.userService.createTrainer(this.newTrainer).subscribe({
      next: (response: any) => {
        this.success = 'Trainer created successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.closeCreateModal();
          this.loadUsers();
          this.success = '';
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error creating trainer:', err);
        this.error = err.error?.message || 'Failed to create trainer';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'TRAINER': return 'badge-trainer';
      case 'STUDENT': return 'badge-student';
      default: return '';
    }
  }

  getUserStats(user: User): string {
    if (user.role === 'STUDENT') {
      const attempts = user._count?.assessmentAttempts || 0;
      const submissions = user._count?.feedbackSubmissions || 0;
      const projects = user._count?.projects || 0;
      return `${attempts} assessments, ${submissions} submissions, ${projects} projects`;
    } else if (user.role === 'TRAINER') {
      const mentorProjects = user._count?.mentorProjects || 0;
      return `Mentoring ${mentorProjects} projects`;
    }
    return 'N/A';
  }

  exportToExcel(): void {
    this.isLoading = true;
    this.error = '';

    const role = this.selectedRole !== 'ALL' ? this.selectedRole : undefined;
    const batch = this.selectedBatch !== 'ALL' ? this.selectedBatch : undefined;

    this.userService.exportUsers(role, batch).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.success = 'Excel file downloaded successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Export error:', err);
        this.error = err.error?.message || 'Failed to export users';
        this.isLoading = false;
      }
    });
  }

  // Direct Feedback functionality
  showFeedbackModal = false;
  selectedUser: User | null = null;
  feedbackData = {
    marks: null as number | null,
    maxMarks: null as number | null,
    comments: '',
    category: 'GENERAL'
  };

  openFeedbackModal(user: User): void {
    if (user.role === 'ADMIN') {
      this.error = 'You cannot give feedback to admins';
      setTimeout(() => this.error = '', 3000);
      return;
    }
    this.selectedUser = user;
    this.showFeedbackModal = true;
    this.feedbackData = {
      marks: null,
      maxMarks: null,
      comments: '',
      category: 'GENERAL'
    };
    this.error = '';
    this.success = '';
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.selectedUser = null;
    this.feedbackData = {
      marks: null,
      maxMarks: null,
      comments: '',
      category: 'GENERAL'
    };
  }

  submitFeedback(): void {
    if (!this.selectedUser || !this.feedbackData.comments.trim()) {
      this.error = 'Comments are required';
      return;
    }

    if (this.feedbackData.marks !== null && this.feedbackData.maxMarks !== null) {
      if (this.feedbackData.marks > this.feedbackData.maxMarks) {
        this.error = 'Marks cannot be greater than max marks';
        return;
      }
    }

    this.isLoading = true;
    this.error = '';

    const feedbackPayload = {
      recipientId: this.selectedUser.id,
      marks: this.feedbackData.marks,
      maxMarks: this.feedbackData.maxMarks,
      comments: this.feedbackData.comments,
      category: this.feedbackData.category
    };

    this.userService.giveFeedback(feedbackPayload).subscribe({
      next: () => {
        this.success = 'Feedback submitted successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.closeFeedbackModal();
          this.success = '';
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error submitting feedback:', err);
        this.error = err.error?.error || err.error?.message || 'Failed to submit feedback';
        this.isLoading = false;
      }
    });
  }

  // Toggle feedback permission for trainer
  toggleFeedbackPermission(user: User): void {
    if (user.role !== 'TRAINER') return;

    this.isLoading = true;
    this.error = '';

    this.userService.toggleFeedbackPermission(user.id).subscribe({
      next: (response: any) => {
        this.success = response.message || 'Feedback permission updated successfully!';
        this.isLoading = false;
        // Reload users to get updated permission
        this.loadUsers();
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Error toggling feedback permission:', err);
        this.error = err.error?.message || 'Failed to update permission';
        this.isLoading = false;
      }
    });
  }
}
