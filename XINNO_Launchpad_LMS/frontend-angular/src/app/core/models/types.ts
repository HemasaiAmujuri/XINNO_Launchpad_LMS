export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TRAINER' | 'REVIEWER' | 'STUDENT';
  courseType?: 'CRT' | 'ORACLE' | 'EPM' | 'OIC' | 'FULL_STACK';
  batchName?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  courseType: string;
  totalMarks: number;
  passingMarks: number;
  timeLimitMinutes: number;
  isPublished: boolean;
  allowReAttempt: boolean;
  createdAt: Date;
  _count?: {
    questions: number;
    attempts: number;
  };
  // Extended fields for student view
  totalQuestions?: number;
  mcqCount?: number;
  descriptiveCount?: number;
  canAttempt?: boolean;
  lastAttempt?: {
    id: string;
    status: string;
    submittedAt?: Date;
    totalMarks: number;
    obtainedMarks: number;
    isPassed: boolean;
  };
}

export interface Question {
  id: string;
  questionText: string;
  questionType: 'MCQ' | 'DESCRIPTIVE';
  marks: number;
  orderIndex: number;
  options?: string[];
  characterLimit?: number;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED';
  startedAt?: Date;
  submittedAt?: Date;
  timeSpentSeconds: number;
  totalMarks: number;
  obtainedMarks: number;
  isPassed: boolean;
  isAutoSubmitted: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  studentId: string;
  mentorId: string;
  courseType: string;
  startDate: Date;
  endDate: Date;
  currentStage: string;
  completionPercent: number;
  isCompleted: boolean;
  student?: User;
  mentor?: User;
}

export interface ProjectStageProgress {
  id: string;
  projectId: string;
  stage: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: Date;
  completionDate?: Date;
  mentorRemarks?: string;
  studentNotes?: string;
}

export interface FeedbackForm {
  id: string;
  title: string;
  description?: string;
  forRole: string;
  courseType?: string;
  isActive: boolean;
  createdAt: Date;
}
