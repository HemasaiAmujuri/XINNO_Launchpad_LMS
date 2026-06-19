import { z } from 'zod';

// User Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'TRAINER', 'REVIEWER', 'STUDENT']).optional(), // Optional for public registration
  courseType: z.enum(['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK']),
  courseLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  batchName: z.string().optional(),
  rollNumber: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  courseType: z.enum(['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK']).optional(),
  batchName: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Assessment Validation Schemas
export const createAssessmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  courseType: z.enum(['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK']),
  batchName: z.string().optional(),
  totalMarks: z.number().int().positive('Total marks must be positive'),
  passingMarks: z.number().int().positive('Passing marks must be positive'),
  timeLimitMinutes: z.number().int().min(5).max(180).default(15),
  instructions: z.string().optional(),
  isPublished: z.boolean().default(false),
  allowReAttempt: z.boolean().default(false),
  showResults: z.boolean().default(true),
  accessPin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits').optional(),
});

export const createQuestionSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID'),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  questionType: z.enum(['MCQ', 'DESCRIPTIVE']),
  marks: z.number().int().positive('Marks must be positive'),
  difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']),
  orderIndex: z.number().int().nonnegative(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().optional(),
  characterLimit: z.number().int().positive().optional(),
  sampleAnswer: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const startAssessmentSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID'),
});

export const submitAnswerSchema = z.object({
  attemptId: z.string().uuid('Invalid attempt ID'),
  questionId: z.string().uuid('Invalid question ID'),
  answerText: z.string().min(1, 'Answer cannot be empty'),
});

export const submitAssessmentSchema = z.object({
  attemptId: z.string().uuid('Invalid attempt ID'),
});

// Project Validation Schemas
export const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  studentId: z.string().uuid('Invalid student ID'),
  mentorId: z.string().uuid('Invalid mentor ID'),
  courseType: z.enum(['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK']),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
});

export const updateProjectStageSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  stage: z.enum([
    'PROBLEM_STATEMENT',
    'REQUIREMENT_ANALYSIS',
    'DESIGN_ARCHITECTURE',
    'DEVELOPMENT',
    'TESTING_VALIDATION',
    'DOCUMENTATION',
    'FINAL_DEMO_REVIEW',
  ]),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  mentorRemarks: z.string().optional(),
  studentNotes: z.string().optional(),
});

// Feedback Validation Schemas
export const createFeedbackFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  forRole: z.enum(['ADMIN', 'TRAINER', 'REVIEWER', 'STUDENT']),
  courseType: z.enum(['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK']).optional(),
  isActive: z.boolean().default(true),
});

export const createFeedbackQuestionSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  questionText: z.string().min(10, 'Question must be at least 10 characters'),
  questionType: z.enum(['TEXT', 'RATING', 'MCQ', 'CHECKBOX']),
  isRequired: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  orderIndex: z.number().int().nonnegative(),
});

export const submitFeedbackSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  responses: z.array(
    z.object({
      questionId: z.string().uuid('Invalid question ID'),
      responseText: z.string().min(1, 'Response cannot be empty'),
    })
  ).min(1, 'At least one response is required'),
});

// Common Validation
export const uuidSchema = z.string().uuid('Invalid ID format');
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});
