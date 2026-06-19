import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminAssessmentService } from '../../../core/services/admin-assessment.service';
import { AssessmentService } from '../../../core/services/assessment.service';

@Component({
  selector: 'app-edit-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-assessment.component.html',
  styleUrl: './edit-assessment.component.css'
})
export class EditAssessmentComponent implements OnInit {
  assessmentForm!: FormGroup;
  assessmentId: string = '';
  loading = false;
  loadingAssessment = true;
  error = '';
  success = '';
  
  availableQuestions: any[] = [];
  selectedQuestionIds: string[] = [];
  
  courseTypes = [
    { value: 'FULL_STACK', label: 'Full Stack Development' },
    { value: 'CRT', label: 'CRT (Cloud Readiness Training)' },
    { value: 'ORACLE', label: 'Oracle Technologies' },
    { value: 'EPM', label: 'EPM (Enterprise Performance Management)' },
    { value: 'OIC', label: 'OIC (Oracle Integration Cloud)' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminAssessmentService,
    private assessmentService: AssessmentService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.assessmentId = this.route.snapshot.paramMap.get('id') || '';
    if (this.assessmentId) {
      this.loadAssessment();
      this.loadQuestions();
    }
  }

  initForm(): void {
    this.assessmentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      instructions: ['', [Validators.required, Validators.minLength(20)]],
      courseLevel: ['', Validators.required],
      batchName: ['', Validators.required],
      timeLimit: [15, [Validators.required, Validators.min(5), Validators.max(180)]],
      totalMarks: [0, [Validators.required, Validators.min(1)]],
      passingMarks: [40, [Validators.required, Validators.min(1), Validators.max(100)]],
      isPublished: [true],
      allowReAttempt: [false],
      showResults: [true]
    });
  }

  loadAssessment(): void {
    this.loadingAssessment = true;
    this.assessmentService.getAssessmentById(this.assessmentId).subscribe({
      next: (response) => {
        const assessment = response.data || response;
        this.assessmentForm.patchValue({
          title: assessment.title,
          instructions: assessment.instructions || '',
          courseLevel: assessment.courseType,
          batchName: assessment.batchName || '',
          timeLimit: assessment.timeLimitMinutes,
          totalMarks: assessment.totalMarks,
          passingMarks: assessment.passingMarks,
          isPublished: assessment.isPublished,
          allowReAttempt: assessment.allowReAttempt,
          showResults: assessment.showResults
        });
        
        // Set selected questions
        if (assessment.questions) {
          this.selectedQuestionIds = assessment.questions.map((q: any) => q.id);
        }
        
        this.loadingAssessment = false;
      },
      error: (err) => {
        this.error = 'Failed to load assessment';
        this.loadingAssessment = false;
        console.error('Error loading assessment:', err);
      }
    });
  }

  loadQuestions(): void {
    this.adminService.getQuestions().subscribe({
      next: (response) => {
        this.availableQuestions = Array.isArray(response) ? response : (response.data || []);
      },
      error: (err) => {
        console.error('Error loading questions:', err);
      }
    });
  }

  toggleQuestionSelection(questionId: string): void {
    const index = this.selectedQuestionIds.indexOf(questionId);
    if (index > -1) {
      this.selectedQuestionIds.splice(index, 1);
    } else {
      this.selectedQuestionIds.push(questionId);
    }
    this.updateTotalMarks();
  }

  isQuestionSelected(questionId: string): boolean {
    return this.selectedQuestionIds.includes(questionId);
  }

  updateTotalMarks(): void {
    const totalMarks = this.selectedQuestionIds.reduce((sum, qId) => {
      const question = this.availableQuestions.find(q => q.id === qId);
      return sum + (question?.marks || 0);
    }, 0);
    this.assessmentForm.patchValue({ totalMarks });
  }

  onSubmit(): void {
    if (this.assessmentForm.invalid) {
      this.error = 'Please fill all required fields correctly';
      Object.keys(this.assessmentForm.controls).forEach(key => {
        this.assessmentForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.selectedQuestionIds.length === 0) {
      this.error = 'Please select at least one question';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const formData = {
      ...this.assessmentForm.value,
      questionIds: this.selectedQuestionIds
    };

    this.adminService.updateAssessment(this.assessmentId, formData).subscribe({
      next: () => {
        this.success = 'Assessment updated successfully!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to update assessment';
        this.loading = false;
        console.error('Error updating assessment:', err);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin']);
  }
}
