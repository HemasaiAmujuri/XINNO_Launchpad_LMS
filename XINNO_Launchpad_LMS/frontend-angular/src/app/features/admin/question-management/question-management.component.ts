import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminAssessmentService } from '../../../core/services/admin-assessment.service';
import { Router } from '@angular/router';

interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options?: string[];
  correctAnswer?: string;
  characterLimit?: number;
  courseLevel: string;
  isActive: boolean;
}

@Component({
  selector: 'app-question-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './question-management.component.html',
  styleUrl: './question-management.component.css'
})
export class QuestionManagementComponent implements OnInit {
  questions: Question[] = [];
  filteredQuestions: Question[] = [];
  questionForm!: FormGroup;
  
  isLoading = false;
  error = '';
  success = '';
  showModal = false;
  editingQuestion: Question | null = null;
  
  // Filters
  filterType: 'ALL' | 'MCQ' | 'DESCRIPTIVE' = 'ALL';
  filterDifficulty: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD' = 'ALL';
  filterCourse = '';
  searchQuery = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

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
    this.questionForm = this.fb.group({
      questionText: ['', [Validators.required, Validators.minLength(10)]],
      type: ['MCQ', Validators.required],
      marks: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      difficulty: ['MEDIUM', Validators.required],
      courseLevel: ['', Validators.required],
      characterLimit: [500],
      options: this.fb.array([]),
      correctAnswer: ['']
    });

    // Add default 4 options for MCQ
    this.addOption();
    this.addOption();
    this.addOption();
    this.addOption();

    // Watch type changes
    this.questionForm.get('type')?.valueChanges.subscribe(type => {
      this.onTypeChange(type);
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  get mcqQuestionsCount(): number {
    return this.questions.filter(q => q.type === 'MCQ').length;
  }

  get descriptiveQuestionsCount(): number {
    return this.questions.filter(q => q.type === 'DESCRIPTIVE').length;
  }

  get activeQuestionsCount(): number {
    return this.questions.filter(q => q.isActive).length;
  }

  addOption(): void {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  onTypeChange(type: string): void {
    const characterLimitControl = this.questionForm.get('characterLimit');
    const correctAnswerControl = this.questionForm.get('correctAnswer');
    
    if (type === 'MCQ') {
      this.options.setValidators(Validators.required);
      correctAnswerControl?.setValidators(Validators.required);
      characterLimitControl?.clearValidators();
      
      // Ensure at least 2 options
      while (this.options.length < 2) {
        this.addOption();
      }
    } else {
      this.options.clearValidators();
      correctAnswerControl?.clearValidators();
      characterLimitControl?.setValidators([Validators.required, Validators.min(50)]);
      
      // Clear options for descriptive
      this.options.clear();
    }
    
    this.options.updateValueAndValidity();
    correctAnswerControl?.updateValueAndValidity();
    characterLimitControl?.updateValueAndValidity();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.error = '';
    
    this.adminService.getQuestions({}).subscribe({
      next: (response) => {
        // Backend returns { success: true, data: [...questions] }
        const questions = Array.isArray(response) ? response : (response.data || []);
        this.questions = questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          type: q.questionType || q.type,
          marks: q.marks,
          difficulty: q.difficultyLevel || q.difficulty,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
          correctAnswer: q.correctAnswer,
          characterLimit: q.characterLimit,
          courseLevel: q.assessment?.courseType || q.courseLevel || 'N/A',
          isActive: q.isActive !== false
        }));
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load questions';
        this.isLoading = false;
        console.error('Load questions error:', err);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.questions];
    
    // Type filter
    if (this.filterType !== 'ALL') {
      filtered = filtered.filter(q => q.type === this.filterType);
    }
    
    // Difficulty filter
    if (this.filterDifficulty !== 'ALL') {
      filtered = filtered.filter(q => q.difficulty === this.filterDifficulty);
    }
    
    // Course filter
    if (this.filterCourse) {
      filtered = filtered.filter(q => 
        q.courseLevel.toLowerCase().includes(this.filterCourse.toLowerCase())
      );
    }
    
    // Search query
    if (this.searchQuery) {
      filtered = filtered.filter(q =>
        q.questionText.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    this.filteredQuestions = filtered;
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  get paginatedQuestions(): Question[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredQuestions.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openModal(question?: Question): void {
    this.editingQuestion = question || null;
    this.showModal = true;
    
    if (question) {
      // Edit mode
      this.questionForm.patchValue({
        questionText: question.questionText,
        type: question.type,
        marks: question.marks,
        difficulty: question.difficulty,
        courseLevel: question.courseLevel,
        characterLimit: question.characterLimit || 500,
        correctAnswer: question.correctAnswer || ''
      });
      
      // Set options for MCQ
      if (question.type === 'MCQ' && question.options) {
        this.options.clear();
        question.options.forEach(opt => {
          this.options.push(this.fb.control(opt, Validators.required));
        });
      }
    } else {
      // Create mode
      this.questionForm.reset({
        type: 'MCQ',
        marks: 1,
        difficulty: 'MEDIUM',
        characterLimit: 500
      });
      this.options.clear();
      for (let i = 0; i < 4; i++) {
        this.addOption();
      }
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.editingQuestion = null;
    this.error = '';
    this.success = '';
  }

  saveQuestion(): void {
    if (this.questionForm.invalid) {
      this.error = 'Please fill all required fields correctly';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    this.success = '';
    
    const formData = this.questionForm.value;
    const questionData: any = {
      questionText: formData.questionText,
      questionType: formData.type, // Backend expects questionType
      marks: formData.marks,
      difficultyLevel: formData.difficulty, // Backend expects difficultyLevel
      courseLevel: formData.courseLevel,
      isActive: true
    };
    
    if (formData.type === 'MCQ') {
      questionData.options = formData.options.filter((opt: string) => opt.trim());
      questionData.correctAnswer = formData.correctAnswer;
    } else {
      questionData.characterLimit = formData.characterLimit;
    }
    
    if (this.editingQuestion) {
      // Update
      this.adminService.updateQuestion(this.editingQuestion.id, questionData).subscribe({
        next: () => {
          this.success = 'Question updated successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.closeModal();
            this.loadQuestions();
          }, 1500);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update question';
          this.isLoading = false;
        }
      });
    } else {
      // Create
      this.adminService.createQuestion(questionData).subscribe({
        next: () => {
          this.success = 'Question created successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.closeModal();
            this.loadQuestions();
          }, 1500);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to create question';
          this.isLoading = false;
        }
      });
    }
  }

  deleteQuestion(question: Question): void {
    if (!confirm(`Are you sure you want to delete this question?\n\n"${question.questionText.substring(0, 100)}..."`)) {
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.adminService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.success = 'Question deleted successfully!';
        this.isLoading = false;
        this.loadQuestions();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to delete question';
        this.isLoading = false;
      }
    });
  }

  toggleActive(question: Question): void {
    this.adminService.updateQuestion(question.id, { isActive: !question.isActive }).subscribe({
      next: () => {
        question.isActive = !question.isActive;
        this.success = `Question ${question.isActive ? 'activated' : 'deactivated'} successfully!`;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update question status';
      }
    });
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  goToCreateAssessment(): void {
    this.router.navigate(['/admin/create-assessment']);
  }
}
