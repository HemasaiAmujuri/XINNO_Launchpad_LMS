import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAssessmentService } from '../../../core/services/admin-assessment.service';

interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  difficulty: string;
  courseLevel: string;
  selected?: boolean;
}

interface AssessmentData {
  title: string;
  instructions: string;
  timeLimit: number;
  totalMarks: number;
  passingMarks: number;
  courseLevel: string;
  batchName: string;
  showResults: boolean;
  questionIds: string[];
}

@Component({
  selector: 'app-create-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-assessment.component.html',
  styleUrl: './create-assessment.component.css'
})
export class CreateAssessmentComponent implements OnInit {
  currentStep = 1;
  totalSteps = 3;
  
  // Forms for each step
  basicDetailsForm!: FormGroup;
  availableQuestions: Question[] = [];
  selectedQuestions: Question[] = [];
  
  isLoading = false;
  error = '';
  success = '';
  
  // Filters for question selection
  filterType: 'ALL' | 'MCQ' | 'DESCRIPTIVE' = 'ALL';
  filterDifficulty = '';
  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminAssessmentService,
    private router: Router
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  initForm(): void {
    this.basicDetailsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      instructions: ['', [Validators.required, Validators.minLength(20)]],
      timeLimit: [15, [Validators.required, Validators.min(5), Validators.max(180)]],
      passingMarks: [40, [Validators.required, Validators.min(1), Validators.max(100)]],
      courseLevel: ['', Validators.required],
      batchName: ['', Validators.required],
      showResults: [true],
      accessPin: ['', [Validators.pattern(/^\d{4}$/)]]
    });
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.adminService.getQuestions({ isActive: true }).subscribe({
      next: (response) => {
        // Backend returns { success: true, data: [...questions] }
        const questions = Array.isArray(response) ? response : (response.data || []);
        this.availableQuestions = questions.map((q: any) => ({
          ...q,
          selected: false,
          type: q.questionType || q.type,
          difficulty: q.difficultyLevel || q.difficulty,
          courseLevel: q.assessment?.courseType || q.courseLevel || 'N/A'
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load questions';
        this.isLoading = false;
        console.error('Load questions error:', err);
      }
    });
  }

  get filteredQuestions(): Question[] {
    let filtered = [...this.availableQuestions];
    
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(q => q.type === this.filterType);
    }
    
    if (this.filterDifficulty) {
      filtered = filtered.filter(q => q.difficulty === this.filterDifficulty);
    }
    
    if (this.searchQuery) {
      filtered = filtered.filter(q =>
        q.questionText.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }

  toggleQuestion(question: Question): void {
    question.selected = !question.selected;
    this.updateSelectedQuestions();
  }

  updateSelectedQuestions(): void {
    this.selectedQuestions = this.availableQuestions.filter(q => q.selected);
  }

  removeQuestion(question: Question): void {
    question.selected = false;
    this.updateSelectedQuestions();
  }

  get totalMarks(): number {
    return this.selectedQuestions.reduce((sum, q) => sum + q.marks, 0);
  }

  get mcqCount(): number {
    return this.selectedQuestions.filter(q => q.type === 'MCQ').length;
  }

  get descriptiveCount(): number {
    return this.selectedQuestions.filter(q => q.type === 'DESCRIPTIVE').length;
  }

  nextStep(): void {
    this.error = '';
    
    if (this.currentStep === 1) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.basicDetailsForm.controls).forEach(key => {
        this.basicDetailsForm.get(key)?.markAsTouched();
      });
      
      if (this.basicDetailsForm.invalid) {
        this.error = 'Please fill all required fields correctly';
        // Scroll to top to see error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    if (this.currentStep === 2) {
      if (this.selectedQuestions.length === 0) {
        this.error = 'Please select at least one question';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    
    // Move to next step
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    this.error = '';
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  createAssessment(): void {
    if (this.basicDetailsForm.invalid || this.selectedQuestions.length === 0) {
      this.error = 'Please complete all steps correctly';
      return;
    }

    this.isLoading = true;
    this.error = '';
    
    const formData = this.basicDetailsForm.value;
    
    // Only include accessPin if it's filled
    const assessmentData: any = {
      ...formData,
      totalMarks: this.totalMarks,
      questionIds: this.selectedQuestions.map(q => q.id)
    };
    
    // Remove accessPin if empty
    if (!assessmentData.accessPin || assessmentData.accessPin.trim() === '') {
      delete assessmentData.accessPin;
    }

    this.adminService.createAssessment(assessmentData).subscribe({
      next: () => {
        this.success = 'Assessment created successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/admin/submissions']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create assessment';
        this.isLoading = false;
      }
    });
  }

  goToQuestions(): void {
    this.router.navigate(['/admin/questions']);
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All progress will be lost.')) {
      this.router.navigate(['/admin']);
    }
  }
}
