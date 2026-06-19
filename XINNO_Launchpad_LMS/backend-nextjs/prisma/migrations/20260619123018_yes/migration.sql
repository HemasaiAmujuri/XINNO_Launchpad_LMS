-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'TRAINER', 'REVIEWER', 'STUDENT');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'DESCRIPTIVE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('PROBLEM_STATEMENT', 'REQUIREMENT_ANALYSIS', 'DESIGN_ARCHITECTURE', 'DEVELOPMENT', 'TESTING_VALIDATION', 'DOCUMENTATION', 'FINAL_DEMO_REVIEW');

-- CreateEnum
CREATE TYPE "StageStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "courseType" "CourseType",
    "batchName" TEXT,
    "rollNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "canGiveFeedback" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseLevel" "CourseLevel",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseType" "CourseType" NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "passingMarks" INTEGER NOT NULL,
    "timeLimitMinutes" INTEGER NOT NULL DEFAULT 15,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "allowReAttempt" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "batchName" TEXT,
    "instructions" TEXT,
    "showResults" BOOLEAN NOT NULL DEFAULT true,
    "accessPin" TEXT,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "marks" INTEGER NOT NULL,
    "difficultyLevel" "DifficultyLevel" NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "characterLimit" INTEGER,
    "sampleAnswer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalMarks" INTEGER NOT NULL DEFAULT 0,
    "obtainedMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "isAutoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "remarks" TEXT,

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "marksAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autoEvaluated" BOOLEAN NOT NULL DEFAULT false,
    "evaluatedBy" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "courseType" "CourseType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "currentStage" "ProjectStage" NOT NULL DEFAULT 'PROBLEM_STATEMENT',
    "completionPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "finalGrade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectStageProgress" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stage" "ProjectStage" NOT NULL,
    "status" "StageStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "mentorRemarks" TEXT,
    "studentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "dailyProgress" JSONB,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProjectStageProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "stage" "ProjectStage",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackForm" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "forRole" "UserRole" NOT NULL,
    "courseType" "CourseType",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackQuestion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "orderIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,

    CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackReview" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "rating" INTEGER,
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectFeedback" (
    "id" TEXT NOT NULL,
    "givenBy" TEXT NOT NULL,
    "givenTo" TEXT NOT NULL,
    "marks" DOUBLE PRECISION,
    "maxMarks" DOUBLE PRECISION,
    "comments" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_rollNumber_idx" ON "User"("rollNumber");

-- CreateIndex
CREATE INDEX "Assessment_courseType_idx" ON "Assessment"("courseType");

-- CreateIndex
CREATE INDEX "Assessment_isPublished_idx" ON "Assessment"("isPublished");

-- CreateIndex
CREATE INDEX "Question_assessmentId_idx" ON "Question"("assessmentId");

-- CreateIndex
CREATE INDEX "Question_questionType_idx" ON "Question"("questionType");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_studentId_idx" ON "AssessmentAttempt"("studentId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_status_idx" ON "AssessmentAttempt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttempt_assessmentId_studentId_key" ON "AssessmentAttempt"("assessmentId", "studentId");

-- CreateIndex
CREATE INDEX "Answer_attemptId_idx" ON "Answer"("attemptId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_attemptId_questionId_key" ON "Answer"("attemptId", "questionId");

-- CreateIndex
CREATE INDEX "Project_studentId_idx" ON "Project"("studentId");

-- CreateIndex
CREATE INDEX "Project_mentorId_idx" ON "Project"("mentorId");

-- CreateIndex
CREATE INDEX "Project_currentStage_idx" ON "Project"("currentStage");

-- CreateIndex
CREATE INDEX "ProjectStageProgress_projectId_idx" ON "ProjectStageProgress"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStageProgress_projectId_stage_key" ON "ProjectStageProgress"("projectId", "stage");

-- CreateIndex
CREATE INDEX "ProjectDocument_projectId_idx" ON "ProjectDocument"("projectId");

-- CreateIndex
CREATE INDEX "FeedbackForm_forRole_idx" ON "FeedbackForm"("forRole");

-- CreateIndex
CREATE INDEX "FeedbackForm_isActive_idx" ON "FeedbackForm"("isActive");

-- CreateIndex
CREATE INDEX "FeedbackQuestion_formId_idx" ON "FeedbackQuestion"("formId");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_formId_idx" ON "FeedbackSubmission"("formId");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_submittedBy_idx" ON "FeedbackSubmission"("submittedBy");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackSubmission_formId_submittedBy_key" ON "FeedbackSubmission"("formId", "submittedBy");

-- CreateIndex
CREATE INDEX "FeedbackResponse_submissionId_idx" ON "FeedbackResponse"("submissionId");

-- CreateIndex
CREATE INDEX "FeedbackResponse_questionId_idx" ON "FeedbackResponse"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackResponse_submissionId_questionId_key" ON "FeedbackResponse"("submissionId", "questionId");

-- CreateIndex
CREATE INDEX "FeedbackReview_submissionId_idx" ON "FeedbackReview"("submissionId");

-- CreateIndex
CREATE INDEX "FeedbackReview_reviewedBy_idx" ON "FeedbackReview"("reviewedBy");

-- CreateIndex
CREATE INDEX "DirectFeedback_givenBy_idx" ON "DirectFeedback"("givenBy");

-- CreateIndex
CREATE INDEX "DirectFeedback_givenTo_idx" ON "DirectFeedback"("givenTo");

-- CreateIndex
CREATE INDEX "DirectFeedback_createdAt_idx" ON "DirectFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStageProgress" ADD CONSTRAINT "ProjectStageProgress_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackQuestion" ADD CONSTRAINT "FeedbackQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FeedbackForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackSubmission" ADD CONSTRAINT "FeedbackSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FeedbackForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackSubmission" ADD CONSTRAINT "FeedbackSubmission_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FeedbackQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FeedbackSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackReview" ADD CONSTRAINT "FeedbackReview_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackReview" ADD CONSTRAINT "FeedbackReview_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FeedbackSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectFeedback" ADD CONSTRAINT "DirectFeedback_givenBy_fkey" FOREIGN KEY ("givenBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectFeedback" ADD CONSTRAINT "DirectFeedback_givenTo_fkey" FOREIGN KEY ("givenTo") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
