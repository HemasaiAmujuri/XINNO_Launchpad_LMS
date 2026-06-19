import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AssessmentService, Assessment } from '../../../core/services/assessment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './assessment-list.component.html',
  styleUrl: './assessment-list.component.css'
})
export class AssessmentListComponent implements OnInit {
  assessments: Assessment[] = [];
  loading = false;
  error = '';
  currentUser: any = null;
  showRulesModal = false;
  selectedAssessment: Assessment | null = null;
  showPinModal = false;
  enteredPin = '';
  pinError = '';

  assessmentRules = [
    'Assessment duration is strictly 15 minutes',
    'Auto-submit will occur when time expires',
    'No page refresh is allowed during the assessment',
    'Assessment contains both MCQ and Descriptive questions',
    'Your answers will be auto-saved periodically',
    'MCQ questions will be evaluated automatically',
    'Descriptive answers will be reviewed by trainers',
    'Once submitted, you cannot change your answers'
  ];

  constructor(
    private assessmentService: AssessmentService,
    private authService: AuthService,
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
    this.error = '';

    this.assessmentService.getAssessments().subscribe({
      next: (data) => {
        this.assessments = (data.data || data).map((a: any) => ({
          ...a,
          enteredPin: '' // Add PIN field to each assessment
        }));
        console.log('📋 Loaded assessments:', this.assessments);
        console.log('🔐 PIN check:', this.assessments.map(a => ({ 
          title: a.title, 
          hasAccessPin: a.hasAccessPin 
        })));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assessments. Please try again.';
        this.loading = false;
        console.error('Error loading assessments:', err);
      }
    });
  }

  showAssessmentRules(assessment: Assessment): void {
    this.selectedAssessment = assessment;
    this.showRulesModal = true;
  }

  onPinInput(event: any, assessment: any): void {
    // Only allow digits
    const value = event.target.value.replace(/[^0-9]/g, '');
    assessment.enteredPin = value;
  }

  startAssessmentWithPin(assessment: any): void {
    this.error = '';
    
    // Check if PIN is required
    if (assessment.hasAccessPin) {
      if (!assessment.enteredPin || assessment.enteredPin.trim() === '') {
        this.error = '🔐 Please enter the 4-digit PIN to start this assessment';
        return;
      }
      if (assessment.enteredPin.length !== 4) {
        this.error = '🔐 PIN must be exactly 4 digits';
        return;
      }
    }
    
    this.loading = true;
    this.selectedAssessment = assessment;

    const pin = assessment.hasAccessPin ? assessment.enteredPin : undefined;
    
    console.log('🚀 Starting assessment with:', {
      assessmentId: assessment.id,
      hasAccessPin: assessment.hasAccessPin,
      pin: pin ? '****' : 'none'
    });

    this.assessmentService.startAssessment(assessment.id, pin).subscribe({
      next: (response) => {
        console.log('Start assessment response:', response);
        const data = response.data || response;
        
        // Validate response has questions
        if (!data.questions || data.questions.length === 0) {
          this.loading = false;
          this.error = 'This assessment has no questions. Please contact your instructor.';
          return;
        }

        this.loading = false;
        
        // Navigate with assessment data
        this.router.navigate(['/assessments', assessment.id, 'take'], {
          state: { 
            assessmentData: data,
            attempt: data.attempt,
            questions: data.questions
          }
        });
      },
      error: (err) => {
        this.loading = false;
        const errorMsg = err.error?.error || err.error?.message || 'Failed to start assessment. Please try again.';
        this.error = errorMsg;
        
        // If PIN error, clear the entered PIN
        if (errorMsg.toLowerCase().includes('pin')) {
          if (assessment.enteredPin) {
            assessment.enteredPin = '';
          }
        }
        
        console.error('❌ Error starting assessment:', err);
        
        // Scroll to error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  closeRulesModal(): void {
    this.showRulesModal = false;
    this.selectedAssessment = null;
  }

  proceedToStart(): void {
    // Check if assessment requires PIN
    const requiresPin = this.selectedAssessment?.hasAccessPin;
    
    console.log('Assessment requires PIN:', requiresPin);
    console.log('Selected assessment:', this.selectedAssessment);
    
    if (requiresPin) {
      this.showRulesModal = false;
      this.showPinModal = true;
      this.enteredPin = '';
      this.pinError = '';
    } else {
      this.startAssessment();
    }
  }

  closePinModal(): void {
    this.showPinModal = false;
    this.enteredPin = '';
    this.pinError = '';
    this.selectedAssessment = null;
  }

  submitPin(): void {
    if (!this.enteredPin || this.enteredPin.length !== 4) {
      this.pinError = 'Please enter a 4-digit PIN';
      return;
    }
    this.startAssessment();
  }

  verifyAndStart(): void {
    if (!this.enteredPin || this.enteredPin.length !== 4) {
      this.pinError = 'Please enter a 4-digit PIN';
      return;
    }

    this.startAssessment();
  }

  startAssessment(): void {
    if (!this.selectedAssessment) return;

    // Validate assessment has questions
    if (!this.selectedAssessment.totalQuestions || this.selectedAssessment.totalQuestions === 0) {
      this.error = 'This assessment has no questions. Please contact your instructor.';
      this.closeRulesModal();
      return;
    }

    this.loading = true;
    this.error = ''; // Clear previous errors
    this.pinError = '';
    
    this.assessmentService.startAssessment(this.selectedAssessment!.id, this.enteredPin || undefined).subscribe({
      next: (response) => {
        console.log('Start assessment response:', response);
        const data = response.data || response;
        
        // Validate response has questions
        if (!data.questions || data.questions.length === 0) {
          this.loading = false;
          this.error = 'This assessment has no questions. Please contact your instructor.';
          this.closeRulesModal();
          return;
        }

        this.loading = false;
        
        // Store assessment ID before closing modal (which sets selectedAssessment to null)
        const assessmentId = this.selectedAssessment!.id;
        this.closeRulesModal();
        
        // Navigate with assessment data from start API response
        this.router.navigate(['/assessments', assessmentId, 'take'], {
          state: { 
            assessmentData: data,
            attempt: data.attempt,
            questions: data.questions
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.closePinModal();
        this.closeRulesModal();
        const errorMsg = err.error?.error || err.error?.message || 'Failed to start assessment. Please try again.';
        this.error = errorMsg;
        
        // If PIN error, show in PIN modal
        if (errorMsg.toLowerCase().includes('pin')) {
          this.pinError = errorMsg;
          this.showPinModal = true;
        }
        
        console.error('Error starting assessment:', err);
      }
    });
  }

  getStatusBadgeClass(assessment: Assessment): string {
    if (!assessment.lastAttempt) return 'badge-new';
    if (assessment.lastAttempt.status === 'SUBMITTED') {
      // If not reviewed yet, show under-review badge
      if (!assessment.lastAttempt.reviewedAt) return 'badge-under-review';
      return assessment.lastAttempt.isPassed ? 'badge-passed' : 'badge-failed';
    }
    return 'badge-in-progress';
  }

  getStatusText(assessment: Assessment): string {
    if (!assessment.lastAttempt) return 'Not Started';
    if (assessment.lastAttempt.status === 'SUBMITTED') {
      // If not reviewed yet, show "Under Review"
      if (!assessment.lastAttempt.reviewedAt) return 'Under Review';
      return assessment.lastAttempt.isPassed ? 'Passed' : 'Failed';
    }
    return 'In Progress';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
