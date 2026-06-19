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
  student: {
    id: string;
    name: string;
    email: string;
    batchName?: string;
  };
  mentor: {
    id: string;
    name: string;
    email: string;
  };
  stageProgress: StageProgress[];
  documents?: ProjectDocument[];
}

export interface StageProgress {
  id: string;
  projectId: string;
  stage: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: string;
  completionDate?: string;
  mentorRemarks?: string;
  studentNotes?: string;
  dailyProgress?: any[];
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  stage?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  // Get all projects
  getProjects(studentId?: string): Observable<any> {
    const params: any = {};
    if (studentId) params.studentId = studentId;
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Get project by ID
  getProjectById(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${projectId}`);
  }

  // Create new project
  createProject(project: any): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  // Get project timeline
  getProjectTimeline(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${projectId}/timeline`);
  }

  // Update stage
  updateStage(projectId: string, stageData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${projectId}/stage`, stageData);
  }

  // Add daily progress
  addDailyProgress(projectId: string, stage: string, progressEntry: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}/daily-progress`, {
      stage,
      progressEntry
    });
  }

  // Upload document
  uploadDocument(projectId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${projectId}/documents/upload`, formData);
  }

  // Get project documents
  getProjectDocuments(projectId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${projectId}/documents`);
  }

  // Delete document
  deleteDocument(projectId: string, documentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${projectId}/documents/${documentId}`);
  }

  // Approve stage (admin/mentor only)
  approveStage(projectId: string, stage: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${projectId}/approve-stage`, { stage });
  }
}
