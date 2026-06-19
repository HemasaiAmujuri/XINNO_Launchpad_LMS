import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAssessmentService } from '../../../core/services/admin-assessment.service';
import { AssessmentService } from '../../../core/services/assessment.service';

interface Assessment {
  id: string;
  title: string;
  courseLevel: string;
  batchName: string;
  totalMarks: number;
  submissionCount?: number;
}

interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  studentBatch: string;
  submittedAt: string;
  totalMarks: number;
  obtainedMarks: number;
  isPassed: boolean;
  answers: Answer[];
}

interface Answer {
  id: string;
  questionId: string;
  questionText: string;
  questionType: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  answerText: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  correctAnswer?: string;
  sampleAnswer?: string;
  options?: string[];
  autoEvaluated?: boolean;
}

@Component({
  selector: 'app-review-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-submissions.component.html',
  styleUrl: './review-submissions.component.css'
})
export class ReviewSubmissionsComponent implements OnInit {
  assessments: Assessment[] = [];
  selectedAssessment: Assessment | null = null;
  submissions: Submission[] = [];
  selectedSubmission: Submission | null = null;
  
  isLoading = false;
  error = '';
  success = '';
  showEvaluationModal = false;
  
  // Evaluation state
  evaluationMarks: { [key: string]: number } = {};
  
  // Make Math available in template
  Math = Math;
  
  constructor(
    private adminService: AdminAssessmentService,
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.isLoading = true;
    this.error = '';
    
    this.assessmentService.getAssessments().subscribe({
      next: async (response) => {
        console.log('Assessments response:', response);
        const data = response.data || response;
        let assessmentsArray = Array.isArray(data) ? data : [];
        
        // Filter out Question Bank and non-published assessments
        assessmentsArray = assessmentsArray.filter((a: any) => 
          a.isPublished && a.title !== 'Question Bank'
        );
        
        // Fetch submission count for each assessment
        for (const assessment of assessmentsArray) {
          try {
            const subResponse: any = await this.adminService.getSubmissions(assessment.id).toPromise();
            const subData = subResponse?.data || subResponse || [];
            assessment.submissionCount = Array.isArray(subData) ? subData.length : 0;
          } catch (err) {
            assessment.submissionCount = 0;
          }
        }
        
        this.assessments = assessmentsArray;
        console.log('Loaded assessments:', this.assessments.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading assessments:', err);
        this.error = err.error?.message || 'Failed to load assessments';
        this.isLoading = false;
      }
    });
  }

  selectAssessment(assessment: Assessment): void {
    this.selectedAssessment = assessment;
    this.loadSubmissions(assessment.id);
  }

  loadSubmissions(assessmentId: string): void {
    this.isLoading = true;
    this.error = '';
    this.submissions = [];
    
    this.adminService.getSubmissions(assessmentId).subscribe({
      next: (response: any) => {
        console.log('📥 Submissions response:', response);
        const data = response.data || response;
        const submissionsArray = Array.isArray(data) ? data : [];
        
        this.submissions = submissionsArray.map((sub: any) => ({
          id: sub.id,
          studentName: sub.student?.name || 'Unknown',
          studentEmail: sub.student?.email || '',
          studentBatch: sub.student?.batchName || 'N/A',
          submittedAt: sub.submittedAt,
          totalMarks: sub.totalMarks || 0,
          obtainedMarks: sub.obtainedMarks || 0,
          isPassed: sub.isPassed,
          answers: sub.answers || [],  // Keep raw answers with question objects
          reviewedBy: sub.reviewedBy,
          reviewedAt: sub.reviewedAt
        }));
        
        console.log('✅ Loaded submissions:', this.submissions.length);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading submissions:', err);
        this.error = err.error?.message || 'Failed to load submissions';
        this.isLoading = false;
      }
    });
  }

  viewSubmission(submission: Submission): void {
    console.log('📋 Raw submission data:', submission);
    
    // Transform answers to include question details properly
    const transformedAnswers = submission.answers.map((ans: any) => {
      const question = ans.question || {};
      
      // Parse options if they exist
      let options: string[] = [];
      if (question.questionType === 'MCQ') {
        try {
          // Options might be JSON string or already parsed
          if (typeof question.options === 'string') {
            options = JSON.parse(question.options);
          } else if (Array.isArray(question.options)) {
            options = question.options;
          }
        } catch (e) {
          console.error('Error parsing options:', e);
        }
      }
      
      return {
        id: ans.id,
        questionId: question.id || ans.questionId,
        questionText: question.questionText || 'Question text not available',
        questionType: question.questionType || ans.questionType || 'MCQ',
        marks: question.marks || 0,
        answerText: ans.answerText || '',
        isCorrect: ans.isCorrect,
        marksAwarded: ans.marksAwarded || 0,
        correctAnswer: question.correctAnswer,
        sampleAnswer: question.sampleAnswer,
        options: options,
        autoEvaluated: ans.autoEvaluated
      };
    });
    
    console.log('✅ Transformed answers:', transformedAnswers);
    
    this.selectedSubmission = {
      ...submission,
      answers: transformedAnswers
    };
    
    this.showEvaluationModal = true;
    
    // Initialize evaluation marks
    this.evaluationMarks = {};
    transformedAnswers.forEach(answer => {
      this.evaluationMarks[answer.id] = answer.marksAwarded || 0;
    });
  }

  closeModal(): void {
    this.showEvaluationModal = false;
    this.selectedSubmission = null;
    this.error = '';
    this.success = '';
  }

  get descriptiveAnswers(): Answer[] {
    return this.selectedSubmission?.answers.filter(a => a.questionType === 'DESCRIPTIVE') || [];
  }

  get mcqAnswers(): Answer[] {
    return this.selectedSubmission?.answers.filter(a => a.questionType === 'MCQ') || [];
  }

  get totalEvaluatedMarks(): number {
    if (!this.selectedSubmission) return 0;
    
    let total = 0;
    this.selectedSubmission.answers.forEach(answer => {
      if (answer.questionType === 'MCQ') {
        total += answer.marksAwarded || 0;
      } else {
        total += this.evaluationMarks[answer.id] || 0;
      }
    });
    return total;
  }

  evaluateSubmission(): void {
    if (!this.selectedSubmission) return;
    
    // Validate all answers have valid marks (both MCQ and Descriptive)
    const allAnswers = [...this.mcqAnswers, ...this.descriptiveAnswers];
    const hasInvalidMarks = allAnswers.some(answer => {
      const marks = this.evaluationMarks[answer.id];
      return marks === undefined || marks < 0 || marks > answer.marks;
    });
    
    if (hasInvalidMarks) {
      this.error = 'Please provide valid marks for all answers';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    // Prepare evaluation data - include both MCQ and Descriptive answers
    const evaluationData = {
      answers: allAnswers.map(answer => ({
        answerId: answer.id,
        marksAwarded: this.evaluationMarks[answer.id]
      }))
    };
    
    console.log('📤 Submitting evaluation:', evaluationData);
    
    this.adminService.evaluateSubmission(this.selectedSubmission.id, evaluationData).subscribe({
      next: () => {
        this.success = 'Submission evaluated successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.closeModal();
          if (this.selectedAssessment) {
            this.loadSubmissions(this.selectedAssessment.id);
          }
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Evaluation error:', err);
        this.error = err.error?.message || 'Failed to evaluate submission';
        this.isLoading = false;
      }
    });
  }

  getSubmissionStatus(submission: Submission): string {
    if (submission.obtainedMarks === 0) return 'pending';
    return submission.isPassed ? 'passed' : 'failed';
  }

  getPercentage(submission: Submission): number {
    if (submission.totalMarks === 0) return 0;
    return Math.round((submission.obtainedMarks / submission.totalMarks) * 100);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  backToAssessments(): void {
    this.selectedAssessment = null;
    this.submissions = [];
  }

  exportToExcel(): void {
    if (!this.selectedAssessment) {
      this.error = 'Please select an assessment first';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.adminService.exportSubmissions(this.selectedAssessment.id).subscribe({
      next: (blob: Blob) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.selectedAssessment?.title}_submissions_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.success = 'Excel file downloaded successfully!';
        this.isLoading = false;
        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Export error:', err);
        this.error = err.error?.message || 'Failed to export submissions';
        this.isLoading = false;
      }
    });
  }
}
