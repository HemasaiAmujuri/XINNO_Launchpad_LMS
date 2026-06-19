import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  courseType: string;
  totalMarks: number;
  passingMarks: number;
  timeLimitMinutes: number;
  instructions?: string;
  isPublished: boolean;
  totalQuestions: number;
  mcqCount: number;
  descriptiveCount: number;
  lastAttempt?: any;
  canAttempt: boolean;
  createdAt: string;
  hasAccessPin?: boolean;
  enteredPin?: string;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  orderIndex: number;
  options?: any[];
  correctAnswer?: string;
  characterLimit?: number;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  status: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  totalMarks: number;
  obtainedMarks: number;
  isPassed: boolean;
  reviewedAt?: string;
  reviewedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = `${environment.apiUrl}/assessments`;

  constructor(private http: HttpClient) {}

  // Get all assessments for student
  getAssessments(courseType?: string): Observable<any> {
    const params: any = {};
    if (courseType) params.courseType = courseType;
    return this.http.get<Assessment[]>(this.apiUrl, { params });
  }

  // Get single assessment by ID
  getAssessmentById(assessmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${assessmentId}`);
  }

  // Start assessment
  startAssessment(assessmentId: string, accessPin?: string): Observable<any> {
    const payload: any = { assessmentId };
    if (accessPin) {
      payload.accessPin = accessPin;
    }
    return this.http.post(`${this.apiUrl}/start`, payload);
  }

  // Get assessment questions
  getAssessmentQuestions(assessmentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${assessmentId}/questions`);
  }

  // Save answer (auto-save)
  saveAnswer(assessmentId: string, questionId: string, answerText: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${assessmentId}/save-answer`, {
      questionId,
      answerText
    });
  }

  // Submit assessment
  submitAssessment(assessmentId: string, answers: any[], isAutoSubmit = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/${assessmentId}/submit`, {
      answers,
      isAutoSubmit
    });
  }

  // Get attempt details
  getAttempt(attemptId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/attempts/${attemptId}`);
  }
}
