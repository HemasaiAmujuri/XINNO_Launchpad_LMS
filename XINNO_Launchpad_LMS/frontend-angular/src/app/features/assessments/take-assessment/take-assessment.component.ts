import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssessmentService, Question } from '../../../core/services/assessment.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-take-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './take-assessment.component.html',
  styleUrl: './take-assessment.component.css'
})
export class TakeAssessmentComponent implements OnInit, OnDestroy {
  assessmentId: string = '';
  assessment: any = null;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  answers: Map<string, string> = new Map();
  
  timeRemainingSeconds = 0;
  timerSubscription?: Subscription;
  timerDisplay = '15:00';
  
  loading = true;
  error = '';
  submitting = false;
  autoSaving = false;
  showSubmitConfirm = false;
  
  autoSaveSubscription?: Subscription;
  lastSavedTime: Date | null = null;

  answerForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private fb: FormBuilder
  ) {
    this.answerForm = this.fb.group({
      answer: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.assessmentId = this.route.snapshot.params['id'];
    
    // Check if data was passed via navigation state
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    
    if (state && state.assessmentData) {
      // Use data from navigation state (from start API)
      this.loadFromNavigationState(state);
    } else {
      // Fallback: Load assessment data via API
      this.loadAssessment();
    }
  }

  loadFromNavigationState(state: any): void {
    try {
      console.log('📥 Loading assessment from navigation state:', state);
      const data = state.assessmentData;
      
      if (!data) {
        console.error('❌ No assessment data in state');
        this.error = 'Failed to load assessment. Please try again.';
        this.loading = false;
        return;
      }
      
      // Set assessment details from response
      this.assessment = data.assessment || {
        id: this.assessmentId,
        timeLimitMinutes: 15, // Default fallback
      };
      
      console.log('📋 Assessment:', this.assessment);
      
      // Parse questions from state
      const questionsData = state.questions || data.questions || [];
      console.log('📝 Raw questions data:', questionsData);
      
      this.questions = questionsData.map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
      
      console.log('✅ Parsed questions:', this.questions.length, 'questions');
      
      if (this.questions.length === 0) {
        console.error('❌ No questions found!');
        this.error = 'This assessment has no questions. Please contact your instructor.';
        this.loading = false;
        return;
      }
      
      // Set time remaining from assessment time limit
      this.timeRemainingSeconds = this.assessment.timeLimitMinutes * 60;
      console.log('⏱️ Timer set to:', this.timeRemainingSeconds, 'seconds');
      
      // Start timer and auto-save
      this.startTimer();
      this.startAutoSave();
      this.loadQuestion(0);
      this.loading = false;
      
      console.log('✅ Assessment loaded successfully!');
    } catch (err) {
      console.error('❌ Error loading from navigation state:', err);
      this.error = 'Failed to load assessment. Please try again.';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopAutoSave();
  }

  loadAssessment(): void {
    this.loading = true;
    this.assessmentService.getAssessmentQuestions(this.assessmentId).subscribe({
      next: (response) => {
        const data = response.data || response;
        this.assessment = data.assessment;
        this.questions = data.questions;
        this.timeRemainingSeconds = this.assessment.timeLimitMinutes * 60;
        this.startTimer();
        this.startAutoSave();
        this.loadQuestion(0);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assessment';
        this.loading = false;
      }
    });
  }

  loadQuestion(index: number): void {
    if (index < 0 || index >= this.questions.length) return;
    this.currentQuestionIndex = index;
    const savedAnswer = this.answers.get(this.currentQuestion.id) || '';
    this.answerForm.patchValue({ answer: savedAnswer });
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get answeredCount(): number {
    return this.answers.size;
  }

  saveCurrentAnswer(): void {
    const answer = this.answerForm.get('answer')?.value;
    if (answer) {
      this.answers.set(this.currentQuestion.id, answer);
    }
  }

  nextQuestion(): void {
    this.saveCurrentAnswer();
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.loadQuestion(this.currentQuestionIndex + 1);
    }
  }

  previousQuestion(): void {
    this.saveCurrentAnswer();
    if (this.currentQuestionIndex > 0) {
      this.loadQuestion(this.currentQuestionIndex - 1);
    }
  }

  jumpToQuestion(index: number): void {
    this.saveCurrentAnswer();
    this.loadQuestion(index);
  }

  startTimer(): void {
    this.updateTimerDisplay();
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timeRemainingSeconds--;
      this.updateTimerDisplay();
      if (this.timeRemainingSeconds <= 0) {
        this.stopTimer();
        this.submitAssessment(true);
      }
    });
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  updateTimerDisplay(): void {
    const minutes = Math.floor(this.timeRemainingSeconds / 60);
    const seconds = this.timeRemainingSeconds % 60;
    this.timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get isTimerCritical(): boolean {
    return this.timeRemainingSeconds <= 60;
  }

  startAutoSave(): void {
    this.autoSaveSubscription = interval(30000).subscribe(() => {
      this.autoSaveAnswers();
    });
  }

  stopAutoSave(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }

  autoSaveAnswers(): void {
    if (this.answers.size === 0) return;
    this.autoSaving = true;
    const currentAnswer = this.answerForm.get('answer')?.value;
    if (currentAnswer) {
      this.answers.set(this.currentQuestion.id, currentAnswer);
    }
    this.answers.forEach((answerText, questionId) => {
      this.assessmentService.saveAnswer(this.assessmentId, questionId, answerText).subscribe({
        next: () => {
          this.lastSavedTime = new Date();
          this.autoSaving = false;
        }
      });
    });
  }

  confirmSubmit(): void {
    this.saveCurrentAnswer();
    const unanswered = this.questions.length - this.answers.size;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }
    this.showSubmitConfirm = true;
  }

  cancelSubmit(): void {
    this.showSubmitConfirm = false;
  }

  submitAssessment(isAutoSubmit = false): void {
    this.saveCurrentAnswer();
    this.submitting = true;
    this.showSubmitConfirm = false;
    this.stopTimer();
    this.stopAutoSave();

    const answersArray = Array.from(this.answers.entries()).map(([questionId, answerText]) => ({
      questionId,
      answerText
    }));

    this.assessmentService.submitAssessment(this.assessmentId, answersArray, isAutoSubmit).subscribe({
      next: () => {
        this.submitting = false;
        alert(isAutoSubmit ? 'Time up! Auto-submitted.' : 'Submitted successfully!');
        this.router.navigate(['/assessments']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = 'Failed to submit';
        if (!isAutoSubmit) {
          this.startTimer();
        }
      }
    });
  }

  getCharacterCount(): number {
    return this.answerForm.get('answer')?.value?.length || 0;
  }

  isQuestionAnswered(index: number): boolean {
    return this.answers.has(this.questions[index].id);
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
