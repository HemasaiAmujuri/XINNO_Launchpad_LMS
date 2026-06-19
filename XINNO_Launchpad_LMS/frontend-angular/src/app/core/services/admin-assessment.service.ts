import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Question {
  id?: string;
  assessmentId: string;
  questionText: string;
  questionType: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
  orderIndex: number;
  options?: string[];
  correctAnswer?: string;
  characterLimit?: number;
  sampleAnswer?: string;
  isActive?: boolean;
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  status: string;
  submittedAt: string;
  totalMarks: number;
  obtainedMarks: number;
  isPassed: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    batchName?: string;
  };
  answers: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminAssessmentService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Question Management
  getQuestions(filters?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/questions`, { params: filters });
  }

  createQuestion(question: Question): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions`, question);
  }

  updateQuestion(questionId: string, question: Partial<Question>): Observable<any> {
    return this.http.put(`${this.apiUrl}/questions/${questionId}`, question);
  }

  deleteQuestion(questionId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/questions/${questionId}`);
  }

  // Assessment Management
  createAssessment(assessment: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/assessments`, assessment);
  }

  updateAssessment(assessmentId: string, assessment: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/assessments/${assessmentId}`, assessment);
  }

  // Submission Review
  getSubmissions(assessmentId: string): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.apiUrl}/assessments/${assessmentId}/submissions`);
  }

  exportSubmissions(assessmentId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/assessments/${assessmentId}/submissions/export`, {
      responseType: 'blob'
    });
  }

  evaluateSubmission(attemptId: string, evaluation: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/submissions/${attemptId}/evaluate`, evaluation);
  }
}
