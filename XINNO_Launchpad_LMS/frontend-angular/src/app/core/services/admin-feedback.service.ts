import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminFeedbackService {
  private apiUrl = `${environment.apiUrl}/admin/feedback`;

  constructor(private http: HttpClient) {}

  // Get all feedback forms
  getAllForms(filters?: any): Observable<any> {
    const params: any = {};
    if (filters) {
      if (filters.forRole) params.forRole = filters.forRole;
      if (filters.courseType) params.courseType = filters.courseType;
      if (filters.isActive !== undefined) params.isActive = filters.isActive;
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get form by ID
  getFormById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Alias for getFormById (for consistency)
  getFeedbackForm(id: string): Observable<any> {
    return this.getFormById(id);
  }

  // Create new feedback form
  createForm(formData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Update feedback form
  updateForm(id: string, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, formData);
  }

  // Delete feedback form
  deleteForm(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Get submissions for a form
  getFormSubmissions(formId: string, userId?: string): Observable<any> {
    const params: any = {};
    if (userId) params.userId = userId;
    return this.http.get<any>(`${this.apiUrl}/${formId}/submissions`, { params });
  }

  // Get analytics for a form
  getFormAnalytics(formId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${formId}/analytics`);
  }

  // Add review to a submission
  addReview(submissionId: string, reviewData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/submissions/${submissionId}/review`,
      reviewData
    );
  }

  // Alias for addReview (for consistency)
  addSubmissionReview(submissionId: string, reviewData: any): Observable<any> {
    return this.addReview(submissionId, reviewData);
  }

  // Get reviews for a submission
  getSubmissionReviews(submissionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/submissions/${submissionId}/review`);
  }
}
