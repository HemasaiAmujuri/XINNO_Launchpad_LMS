import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) {}

  // Get available feedback forms
  getForms(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Get form by ID
  getFormById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Submit feedback
  submitFeedback(formId: string, responses: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${formId}/submit`, { responses });
  }

  // Get user's submissions
  getMySubmissions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-submissions`);
  }
}
