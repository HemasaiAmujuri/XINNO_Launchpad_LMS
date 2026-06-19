import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TRAINER' | 'ADMIN';
  courseType?: string;
  courseLevel?: string;
  batchName?: string;
  isActive: boolean;
  canGiveFeedback?: boolean; // Permission flag for trainers
  createdAt: string;
  updatedAt: string;
  _count?: {
    assessmentAttempts: number;
    feedbackSubmissions: number;
    projects: number;
    mentorProjects: number;
  };
}

export interface CreateTrainerRequest {
  name: string;
  email: string;
  password: string;
  courseType?: string;
  courseLevel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getUsers(role?: string, batch?: string): Observable<any> {
    let params: any = {};
    if (role) params.role = role;
    if (batch) params.batch = batch;
    return this.http.get(this.apiUrl, { params });
  }

  createTrainer(data: CreateTrainerRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, data);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  exportUsers(role?: string, batch?: string): Observable<Blob> {
    let params: any = {};
    if (role) params.role = role;
    if (batch) params.batch = batch;
    return this.http.get(`${this.apiUrl}/export`, { 
      params,
      responseType: 'blob'
    });
  }

  giveFeedback(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/admin/direct-feedback`, data);
  }

  getMyFeedbacks(userId?: string): Observable<any> {
    let params: any = {};
    if (userId) {
      params.recipientId = userId;
    }
    return this.http.get(`${environment.apiUrl}/admin/direct-feedback`, { params });
  }

  toggleFeedbackPermission(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/toggle-feedback`, {});
  }
}
