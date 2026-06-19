import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Project {
  id: string;
  title: string;
  description: string;
  studentId: string;
  mentorId: string;
  courseType: string;
  startDate: string;
  endDate: string;
  currentStage: string;
  completionPercent: number;
  isCompleted: boolean;
  finalGrade?: string;
  student?: any;
  mentor?: any;
  stageProgress?: any[];
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStageProgress {
  id: string;
  projectId: string;
  stage: string;
  status: string;
  startDate?: string;
  completionDate?: string;
  mentorRemarks?: string;
  studentNotes?: string;
  dailyProgress?: any;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminProjectService {
  private apiUrl = `${environment.apiUrl}/admin/projects`;

  constructor(private http: HttpClient) {}

  // Get all projects
  getAllProjects(filters?: any): Observable<any> {
    const params: any = {};
    if (filters) {
      if (filters.studentId) params.studentId = filters.studentId;
      if (filters.mentorId) params.mentorId = filters.mentorId;
      if (filters.courseType) params.courseType = filters.courseType;
      if (filters.stage) params.stage = filters.stage;
      if (filters.isCompleted !== undefined) params.isCompleted = filters.isCompleted;
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get project by ID
  getProjectById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Create new project
  createProject(projectData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, projectData);
  }

  // Update project
  updateProject(id: string, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, projectData);
  }

  // Delete project
  deleteProject(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Update stage progress (Admin/Mentor review)
  updateStageProgress(projectId: string, stageData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}/stage`, stageData);
  }

  // Review stage (Approve/Reject with remarks)
  reviewStage(projectId: string, stage: string, reviewData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${projectId}/stage`, {
      stage,
      ...reviewData
    });
  }

  // Get mentors
  getMentors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mentors`);
  }

  // Get students
  getStudents(courseType?: string): Observable<any> {
    const params: any = {};
    if (courseType) params.courseType = courseType;
    return this.http.get<any>(`${this.apiUrl}/students`, { params });
  }
}
