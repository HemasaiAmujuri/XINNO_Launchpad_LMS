# OraXinno Learning Management System (LMS)

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [User Roles & Permissions](#user-roles--permissions)
- [Core Features](#core-features)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

OraXinno LMS is a comprehensive Learning Management System designed for educational institutions to manage courses, assessments, projects, and feedback. The system supports multiple user roles with distinct permissions and provides features for assessment management, project tracking, and performance evaluation.

### Key Highlights
- **Multi-role authentication system** (Admin, Trainer, Reviewer, Student)
- **Assessment module** with MCQ and descriptive questions
- **Project tracking system** with 7-stage progress monitoring
- **Dynamic feedback system** with reviews
- **Real-time assessment timer** with auto-submission
- **Direct feedback mechanism** for trainers and students
- **Role-based access control (RBAC)**

### Design Specifications
- **Primary Color**: `#000786` (Deep Blue)
- **Text Color**: White on colored backgrounds, Black on white cards
- **Font Family**: Poppins (Tiffany & Co inspired)
- **Logo**: http://oraxinno.com/img/logo_oraXinno.png

---

## 💻 Technology Stack

### Backend
- **Framework**: Next.js 14.1.0
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3.3
- **Database**: MySQL (via Prisma ORM)
- **ORM**: Prisma 5.8.0
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **File Processing**: ExcelJS, XLSX

### Frontend
- **Framework**: Angular 17.1.0
- **Language**: TypeScript 5.3.2
- **Styling**: Bootstrap 5.3.8, Custom CSS
- **State Management**: RxJS 7.8.0
- **HTTP Client**: Angular HTTP Client
- **3D Graphics**: Three.js 0.182.0

### Database
- **Primary Database**: MySQL
- **Schema Management**: Prisma Migrate
- **Connection Pooling**: Built-in Prisma

### Development Tools
- **Package Manager**: npm
- **Build Tool**: Angular CLI, Next.js
- **Linting**: ESLint
- **Testing**: Jasmine, Karma

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular)                       │
│                    Port: 4200                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │     Auth     │  │   Dashboard  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Assessments  │  │   Projects   │  │   Feedback   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐                                          │
│  │    Admin     │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Next.js)                        │
│                    Port: 3001                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Auth     │  │   Middleware │  │     API      │     │
│  │   (JWT)      │  │   (Guards)   │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────┐     │
│  │           Business Logic Layer                    │     │
│  │  - User Management  - Assessment Engine          │     │
│  │  - Project Tracking - Feedback System            │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ Prisma ORM
┌─────────────────────────────────────────────────────────────┐
│                    Database (MySQL)                         │
│                    Port: 3306                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Users     │  │ Assessments  │  │   Projects   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Questions   │  │   Answers    │  │   Feedback   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation & Setup

### Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node -v`

2. **npm** (comes with Node.js)
   - Verify: `npm -v`

3. **MySQL** (v8.0 or higher)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use: `brew install mysql` (macOS) / `apt-get install mysql-server` (Linux)
   - Verify: `mysql --version`

4. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/

### Step-by-Step Setup

#### Method 1: Automated Setup (Recommended)

```bash
# Navigate to project directory
cd oraxinnolms

# Make setup script executable
chmod +x setup-all.sh

# Run the setup script
./setup-all.sh
```

The script will:
- Check all prerequisites
- Prompt for database credentials
- Install backend dependencies
- Install frontend dependencies
- Create environment configuration files
- Set up the database schema
- Seed initial data (default admin user)

#### Method 2: Manual Setup

**Step 1: Setup Database**

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE oraxinno_lms;

# Exit MySQL
EXIT;
```

**Step 2: Setup Backend**

```bash
# Navigate to backend directory
cd backend-nextjs

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="mysql://username:password@localhost:3306/oraxinno_lms"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3001"
EOF

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Seed the database
npx tsx prisma/seed.ts

# Build the backend
npm run build
```

**Step 3: Setup Frontend**

```bash
# Navigate to frontend directory (from project root)
cd frontend-angular

# Install dependencies
npm install

# Create environment file
cat > src/environments/environment.ts << EOF
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
EOF

# Build the frontend
npm run build
```

---

## ▶️ Running the Application

### Method 1: Start All Services (Recommended)

```bash
# From project root directory
chmod +x start-all.sh
./start-all.sh
```

This will start:
- Backend server on http://localhost:3001
- Frontend server on http://localhost:4200

### Method 2: Start Services Individually

**Terminal 1 - Backend:**
```bash
cd backend-nextjs
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend-angular
npm start
```

### Method 3: Development Mode

**Terminal 1 - Backend (with hot reload):**
```bash
cd backend-nextjs
npm run dev
```

**Terminal 2 - Frontend (with hot reload):**
```bash
cd frontend-angular
npm start
```

### Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3001/api
- **Prisma Studio** (Database GUI): `cd backend-nextjs && npm run db:studio`

### Default Login Credentials

After seeding the database, you can login with:

**Admin Account:**
- Email: `admin@oraxinno.com`
- Password: `admin123`

**Trainer Account:**
- Email: `trainer@oraxinno.com`
- Password: `trainer123`

**Student Account:**
- Email: `student@oraxinno.com`
- Password: `student123`

### Stopping the Application

```bash
# From project root directory
chmod +x stop-all.sh
./stop-all.sh
```

Or manually stop the processes:
- Press `Ctrl+C` in both terminal windows
- Or use: `killall node` (use with caution)

---

## 👥 User Roles & Permissions

The system implements role-based access control with four distinct user roles:

### 1. ADMIN (Administrator)

**Primary Responsibilities:**
- Complete system administration
- User management
- System configuration

**Permissions:**
- ✅ Create, read, update, delete users (all roles)
- ✅ Manage all assessments
- ✅ Manage all projects
- ✅ Manage feedback forms
- ✅ View all submissions and results
- ✅ Export data (users, results, reports)
- ✅ Enable/disable trainer feedback permissions
- ✅ Manage course types and batches
- ✅ View system analytics and reports
- ✅ Configure assessment settings
- ✅ Approve/reject project stages
- ✅ Review and evaluate submissions
- ✅ Access all admin panel features

**Key Features:**
- User activation/deactivation
- Batch management
- Roll number assignment
- Password reset for any user
- System-wide configuration

### 2. TRAINER

**Primary Responsibilities:**
- Course instruction and management
- Assessment creation and evaluation
- Student mentoring
- Progress tracking

**Permissions:**
- ✅ View all students in assigned batches
- ✅ Create, edit, publish assessments
- ✅ Create and manage questions
- ✅ Review and evaluate student submissions
- ✅ Provide feedback to students
- ✅ Manage assigned projects
- ✅ Approve project stages
- ✅ View student progress and reports
- ✅ Export assessment results
- ✅ Give direct feedback (if enabled by admin)
- ✅ View submitted feedback forms
- ❌ Cannot create/delete users
- ❌ Cannot modify system settings
- ❌ Cannot access other trainers' data (unless shared)

**Key Features:**
- Assessment builder with MCQ and descriptive questions
- Auto-evaluation for MCQs
- Manual evaluation for descriptive answers
- Project mentorship and stage approval
- Student performance analytics
- Direct feedback mechanism

### 3. REVIEWER

**Primary Responsibilities:**
- Assessment evaluation
- Quality assurance
- Feedback provision

**Permissions:**
- ✅ View assigned assessments
- ✅ Review student submissions
- ✅ Evaluate descriptive answers
- ✅ Provide feedback on submissions
- ✅ View assessment reports
- ❌ Cannot create assessments
- ❌ Cannot modify questions
- ❌ Cannot manage projects
- ❌ Cannot create users

**Key Features:**
- Focused evaluation interface
- Submission review dashboard
- Marking and feedback tools

### 4. STUDENT

**Primary Responsibilities:**
- Course participation
- Assessment completion
- Project submission
- Feedback provision

**Permissions:**
- ✅ View available assessments
- ✅ Start and complete assessments (within time limit)
- ✅ View own results and feedback
- ✅ Submit project deliverables
- ✅ Update project progress
- ✅ Submit feedback forms
- ✅ View assigned projects
- ✅ View own performance history
- ✅ Access course materials
- ❌ Cannot view other students' submissions
- ❌ Cannot access admin features
- ❌ Cannot modify assessments
- ❌ Cannot re-attempt assessments (unless allowed)

**Key Features:**
- Assessment interface with timer
- Auto-save functionality
- Result viewing with detailed feedback
- Project tracking dashboard
- Progress visualization
- Feedback submission

---

## 🎓 Core Features

### 1. Authentication System

**Features:**
- JWT-based authentication
- Secure password hashing (bcryptjs)
- Role-based access control
- Session management
- Password reset via email
- Account activation/deactivation

**Security:**
- 7-day token expiration
- HTTP-only cookies
- CORS protection
- Request validation
- SQL injection prevention (Prisma)

### 2. Assessment Module

**Assessment Types:**
- Multiple Choice Questions (MCQ)
- Descriptive Questions
- Mixed assessments

**Features:**
- Timer-based assessments (configurable duration)
- Auto-save functionality
- Auto-submission on timeout
- Re-attempt control
- Access PIN protection
- Batch-specific assignments
- Course type filtering
- Result visibility control

**Question Management:**
- Difficulty levels (Easy, Medium, Hard)
- Custom marks per question
- Character limits for descriptive answers
- Sample answers for reference
- Order management
- Bulk import support

**Evaluation:**
- Auto-evaluation for MCQs
- Manual evaluation for descriptive questions
- Partial marking support
- Feedback provision
- Remarks and comments
- Evaluation tracking

**Results:**
- Total marks calculation
- Passing marks validation
- Pass/fail status
- Detailed feedback per question
- Time tracking
- Attempt history
- Export to Excel

### 3. Project Tracking System

**7-Stage Project Lifecycle:**
1. **Problem Statement** - Project definition
2. **Requirement Analysis** - Requirements gathering
3. **Design Architecture** - System design
4. **Development** - Implementation
5. **Testing & Validation** - Quality assurance
6. **Documentation** - Project documentation
7. **Final Demo & Review** - Project presentation

**Features:**
- Stage-wise progress tracking
- Mentor assignment
- Daily progress logs
- Document uploads
- Stage approval workflow
- Completion percentage
- Timeline management
- Final grade assignment

**Stage Status:**
- Pending
- In Progress
- Completed

### 4. Feedback System

**Dynamic Feedback Forms:**
- Role-based forms (Student, Trainer)
- Custom question types
- Required/optional fields
- Order management
- Active/inactive status

**Feedback Types:**
- **Form-based Feedback** - Structured surveys
- **Direct Feedback** - One-on-one feedback with marks
- **Project Feedback** - Stage-specific comments

**Review System:**
- Rating mechanism
- Comment provision
- Review tracking
- Feedback analytics

### 5. Direct Feedback

**Features:**
- Trainer-to-student feedback
- Student-to-trainer feedback (if enabled)
- Marks allocation (with max marks)
- Category-based feedback
- Feedback history
- Timestamp tracking

**Categories:**
- General
- Performance
- Behavior
- Technical Skills
- Soft Skills

### 6. User Management

**Admin Capabilities:**
- Create users (all roles)
- Bulk user import
- User activation/deactivation
- Role assignment
- Batch assignment
- Course type assignment
- Roll number management
- Password reset
- Export user data

**User Attributes:**
- Name, email, password
- Role (Admin, Trainer, Reviewer, Student)
- Course type (CRT, ORACLE, EPM, OIC, FULL_STACK)
- Course level (Beginner, Intermediate, Advanced)
- Batch name
- Roll number
- Active status
- Feedback permission (for trainers)

### 7. Dashboard & Analytics

**Student Dashboard:**
- Upcoming assessments
- Assigned projects
- Recent feedback
- Performance overview

**Trainer Dashboard:**
- Student list
- Assessment management
- Pending evaluations
- Project monitoring

**Admin Dashboard:**
- System overview
- User statistics
- Assessment analytics
- Performance reports

---

## 🗄️ Database Schema

### Core Tables

#### Users
```
- id (UUID)
- email (unique)
- password (hashed)
- name
- role (ADMIN, TRAINER, REVIEWER, STUDENT)
- courseType (CRT, ORACLE, EPM, OIC, FULL_STACK)
- courseLevel (BEGINNER, INTERMEDIATE, ADVANCED)
- batchName
- rollNumber
- isActive
- canGiveFeedback (for trainers)
- resetToken
- resetTokenExpiry
- timestamps
```

#### Assessments
```
- id (UUID)
- title
- description
- courseType
- totalMarks
- passingMarks
- timeLimitMinutes
- isPublished
- allowReAttempt
- showResults
- accessPin
- batchName
- instructions
- createdBy
- timestamps
```

#### Questions
```
- id (UUID)
- assessmentId (FK)
- questionText
- questionType (MCQ, DESCRIPTIVE)
- marks
- difficultyLevel (EASY, MEDIUM, HARD)
- orderIndex
- options (JSON)
- correctAnswer
- characterLimit
- sampleAnswer
- isActive
- timestamps
```

#### AssessmentAttempts
```
- id (UUID)
- assessmentId (FK)
- studentId (FK)
- status (NOT_STARTED, IN_PROGRESS, COMPLETED, SUBMITTED)
- startedAt
- submittedAt
- timeSpentSeconds
- totalMarks
- obtainedMarks
- isPassed
- isAutoSubmitted
- reviewedBy
- reviewedAt
- remarks
```

#### Answers
```
- id (UUID)
- attemptId (FK)
- questionId (FK)
- answerText
- isCorrect
- marksAwarded
- autoEvaluated
- evaluatedBy
- evaluatedAt
- feedback
- timestamps
```

#### Projects
```
- id (UUID)
- title
- description
- studentId (FK)
- mentorId (FK)
- courseType
- startDate
- endDate
- currentStage (enum: 7 stages)
- completionPercent
- isCompleted
- finalGrade
- timestamps
```

#### ProjectStageProgress
```
- id (UUID)
- projectId (FK)
- stage (enum)
- status (PENDING, IN_PROGRESS, COMPLETED)
- startDate
- completionDate
- mentorRemarks
- studentNotes
- dailyProgress (JSON)
- isApproved
- approvedBy
- approvedAt
- timestamps
```

#### FeedbackForms
```
- id (UUID)
- title
- description
- forRole
- courseType
- isActive
- createdBy
- timestamps
```

#### DirectFeedback
```
- id (UUID)
- givenBy (FK)
- givenTo (FK)
- marks
- maxMarks
- comments
- category
- timestamps
```

### Relationships

- User → AssessmentAttempts (one-to-many)
- User → Projects as Student (one-to-many)
- User → Projects as Mentor (one-to-many)
- User → FeedbackSubmissions (one-to-many)
- Assessment → Questions (one-to-many)
- Assessment → AssessmentAttempts (one-to-many)
- AssessmentAttempt → Answers (one-to-many)
- Project → ProjectStageProgress (one-to-many)
- Project → ProjectDocuments (one-to-many)
- FeedbackForm → FeedbackQuestions (one-to-many)
- FeedbackForm → FeedbackSubmissions (one-to-many)

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

All protected endpoints require JWT token in headers:
```
Authorization: Bearer <token>
```

### API Endpoints

#### Authentication Endpoints

**POST** `/api/auth/register`
- Description: Register new user
- Body: `{ email, password, name, role, courseType, batchName }`
- Response: `{ user, token }`
- Access: Public

**POST** `/api/auth/login`
- Description: Login user
- Body: `{ email, password }`
- Response: `{ user, token }`
- Access: Public

**GET** `/api/auth/me`
- Description: Get current user
- Response: `{ user }`
- Access: Authenticated

**POST** `/api/auth/forgot-password`
- Description: Request password reset
- Body: `{ email }`
- Response: `{ message }`
- Access: Public

**POST** `/api/auth/reset-password`
- Description: Reset password
- Body: `{ token, password }`
- Response: `{ message }`
- Access: Public

#### User Management (Admin)

**GET** `/api/admin/users`
- Description: Get all users with filters
- Query: `?role=STUDENT&courseType=CRT&batchName=Batch1`
- Response: `{ users[] }`
- Access: Admin, Trainer

**POST** `/api/admin/users`
- Description: Create new user
- Body: `{ email, password, name, role, courseType, batchName, rollNumber }`
- Response: `{ user }`
- Access: Admin

**PUT** `/api/admin/users/[id]`
- Description: Update user
- Body: `{ name, isActive, courseType, batchName }`
- Response: `{ user }`
- Access: Admin

**DELETE** `/api/admin/users/[id]`
- Description: Delete user
- Response: `{ message }`
- Access: Admin

**GET** `/api/admin/users/export`
- Description: Export users to Excel
- Response: Excel file
- Access: Admin

#### Assessment Endpoints

**GET** `/api/assessments`
- Description: Get available assessments (student view)
- Response: `{ assessments[] }`
- Access: Student

**GET** `/api/assessments/[id]`
- Description: Get assessment details
- Response: `{ assessment }`
- Access: Student

**POST** `/api/assessments/start`
- Description: Start assessment attempt
- Body: `{ assessmentId, accessPin? }`
- Response: `{ attempt, questions[] }`
- Access: Student

**POST** `/api/assessments/[id]/submit`
- Description: Submit assessment
- Body: `{ attemptId, answers[] }`
- Response: `{ result }`
- Access: Student

**GET** `/api/admin/assessments`
- Description: Get all assessments (admin/trainer view)
- Response: `{ assessments[] }`
- Access: Admin, Trainer, Reviewer

**POST** `/api/admin/assessments`
- Description: Create assessment
- Body: `{ title, description, courseType, totalMarks, passingMarks, timeLimitMinutes, batchName }`
- Response: `{ assessment }`
- Access: Admin, Trainer

**PUT** `/api/admin/assessments/[id]`
- Description: Update assessment
- Body: Assessment fields
- Response: `{ assessment }`
- Access: Admin, Trainer

**DELETE** `/api/admin/assessments/[id]`
- Description: Delete assessment
- Response: `{ message }`
- Access: Admin, Trainer

**GET** `/api/admin/assessments/[id]/submissions`
- Description: Get all submissions for assessment
- Response: `{ submissions[] }`
- Access: Admin, Trainer, Reviewer

**GET** `/api/admin/assessments/[id]/submissions/export`
- Description: Export submissions to Excel
- Response: Excel file
- Access: Admin, Trainer, Reviewer

#### Question Endpoints

**GET** `/api/admin/questions?assessmentId=xxx`
- Description: Get questions for assessment
- Response: `{ questions[] }`
- Access: Admin, Trainer

**POST** `/api/admin/questions`
- Description: Create question
- Body: `{ assessmentId, questionText, questionType, marks, difficultyLevel, options?, correctAnswer? }`
- Response: `{ question }`
- Access: Admin, Trainer

**PUT** `/api/admin/questions/[id]`
- Description: Update question
- Body: Question fields
- Response: `{ question }`
- Access: Admin, Trainer

**DELETE** `/api/admin/questions/[id]`
- Description: Delete question
- Response: `{ message }`
- Access: Admin, Trainer

#### Submission Evaluation

**GET** `/api/admin/submissions/[id]`
- Description: Get submission details
- Response: `{ submission, answers[] }`
- Access: Admin, Trainer, Reviewer

**POST** `/api/admin/submissions/[id]/evaluate`
- Description: Evaluate submission
- Body: `{ answers: [{ answerId, marksAwarded, feedback }], remarks }`
- Response: `{ submission }`
- Access: Admin, Trainer, Reviewer

#### Project Endpoints

**GET** `/api/projects`
- Description: Get user's projects
- Response: `{ projects[] }`
- Access: Student, Trainer

**GET** `/api/projects/[id]`
- Description: Get project details
- Response: `{ project, stageProgress[], documents[] }`
- Access: Student, Trainer

**POST** `/api/projects`
- Description: Create project
- Body: `{ title, description, studentId, mentorId, courseType, startDate, endDate }`
- Response: `{ project }`
- Access: Admin, Trainer

**PUT** `/api/projects/[id]`
- Description: Update project
- Body: Project fields
- Response: `{ project }`
- Access: Student, Trainer

**POST** `/api/admin/projects/[id]/approve`
- Description: Approve project stage
- Body: `{ stage, remarks }`
- Response: `{ project }`
- Access: Admin, Trainer

#### Feedback Endpoints

**GET** `/api/feedback`
- Description: Get available feedback forms
- Response: `{ forms[] }`
- Access: Authenticated

**GET** `/api/feedback/[id]`
- Description: Get feedback form details
- Response: `{ form, questions[] }`
- Access: Authenticated

**POST** `/api/feedback/[id]/submit`
- Description: Submit feedback
- Body: `{ responses: [{ questionId, responseText }] }`
- Response: `{ submission }`
- Access: Authenticated

**GET** `/api/feedback/my-submissions`
- Description: Get user's feedback submissions
- Response: `{ submissions[] }`
- Access: Authenticated

#### Direct Feedback

**GET** `/api/admin/direct-feedback`
- Description: Get direct feedback (given or received)
- Query: `?type=received` or `?type=given`
- Response: `{ feedback[] }`
- Access: Admin, Trainer, Student

**POST** `/api/admin/direct-feedback`
- Description: Give direct feedback
- Body: `{ givenTo, marks, maxMarks, comments, category }`
- Response: `{ feedback }`
- Access: Admin, Trainer

---

## 📁 Project Structure

```
oraxinnolms/
│
├── backend-nextjs/                 # Backend application
│   ├── src/
│   │   ├── app/
│   │   │   └── api/               # API routes
│   │   │       ├── auth/          # Authentication endpoints
│   │   │       ├── assessments/   # Assessment endpoints
│   │   │       ├── projects/      # Project endpoints
│   │   │       ├── feedback/      # Feedback endpoints
│   │   │       ├── users/         # User endpoints
│   │   │       └── admin/         # Admin endpoints
│   │   │           ├── assessments/
│   │   │           ├── questions/
│   │   │           ├── submissions/
│   │   │           ├── projects/
│   │   │           ├── feedback/
│   │   │           ├── direct-feedback/
│   │   │           └── users/
│   │   ├── lib/                   # Utility libraries
│   │   │   ├── auth.ts           # JWT & authentication
│   │   │   ├── prisma.ts         # Database client
│   │   │   ├── email.ts          # Email service
│   │   │   ├── upload.ts         # File upload handler
│   │   │   └── validations.ts    # Input validation
│   │   └── middleware.ts          # Request middleware
│   │
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.ts                # Database seeding
│   │   └── migrations/            # Database migrations
│   │
│   ├── scripts/                   # Utility scripts
│   │   ├── reset-student-attempts.ts
│   │   ├── fix-onboarding-assessments.ts
│   │   └── clean-attempts.ts
│   │
│   ├── public/
│   │   └── project-documents/     # Uploaded documents
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── .env                       # Environment variables
│
├── frontend-angular/               # Frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/              # Core services
│   │   │   │   ├── guards/        # Route guards
│   │   │   │   │   └── auth.guard.ts
│   │   │   │   ├── interceptors/  # HTTP interceptors
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   ├── models/        # Type definitions
│   │   │   │   │   └── types.ts
│   │   │   │   └── services/      # Core services
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── user.service.ts
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── features/          # Feature modules
│   │   │   │   ├── landing/       # Landing page
│   │   │   │   ├── auth/          # Login, register
│   │   │   │   ├── dashboard/     # User dashboard
│   │   │   │   ├── assessments/   # Assessment module
│   │   │   │   ├── projects/      # Project tracking
│   │   │   │   ├── feedback/      # Feedback module
│   │   │   │   └── admin/         # Admin panel
│   │   │   │
│   │   │   ├── shared/            # Shared components
│   │   │   │   └── main-layout/
│   │   │   │
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts      # Routing configuration
│   │   │
│   │   ├── environments/          # Environment configs
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   │
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── angular.json
│
├── setup-all.sh                   # Automated setup script
├── start-all.sh                   # Start all services
├── stop-all.sh                    # Stop all services
├── README.md                      # Basic readme
└── PROJECT_DOCUMENTATION.md       # This file

```

---

## ⚙️ Environment Configuration

### Backend Environment Variables (.env)

Create a `.env` file in `backend-nextjs/` directory:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/oraxinno_lms"

# JWT Configuration
JWT_SECRET="your-secure-random-secret-key-here"
JWT_EXPIRES_IN="7d"

# Node Environment
NODE_ENV="development"

# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@oraxinno.com"

# File Upload (optional)
MAX_FILE_SIZE="10485760"  # 10MB in bytes
ALLOWED_FILE_TYPES="pdf,doc,docx,txt,jpg,png"
```

### Frontend Environment Files

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-domain.com/api'
};
```

### Database Configuration

The system uses MySQL. Update the `DATABASE_URL` in `.env`:

```
mysql://[username]:[password]@[host]:[port]/[database_name]
```

Example:
```
mysql://root:mypassword@localhost:3306/oraxinno_lms
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Error

**Error:** `Can't reach database server at localhost:3306`

**Solution:**
```bash
# Check if MySQL is running
sudo service mysql status   # Linux
brew services list          # macOS

# Start MySQL if not running
sudo service mysql start    # Linux
brew services start mysql   # macOS

# Verify connection
mysql -u root -p
```

#### 2. Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or change port in backend package.json
# Change: "start": "next start -p 3002"
```

#### 3. Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
cd backend-nextjs
npx prisma generate
npm run build
```

#### 4. Migration Failed

**Error:** `Migration failed to apply`

**Solution:**
```bash
cd backend-nextjs

# Reset database (WARNING: This deletes all data)
npx prisma migrate reset --force

# Or manually apply migrations
npx prisma migrate deploy

# Regenerate client
npx prisma generate

# Seed database
npx tsx prisma/seed.ts
```

#### 5. JWT Token Invalid

**Error:** `Invalid token` or `Unauthorized`

**Solution:**
- Clear browser cookies and local storage
- Login again
- Check if JWT_SECRET matches in .env
- Verify token hasn't expired

#### 6. CORS Error

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
- Ensure backend is running on port 3001
- Check `next.config.js` has proper CORS settings
- Clear browser cache
- Use correct API URL in Angular environment file

#### 7. Angular Build Fails

**Error:** `ng: command not found`

**Solution:**
```bash
cd frontend-angular

# Install Angular CLI globally
npm install -g @angular/cli

# Or use npx
npx ng serve
```

#### 8. Dependencies Installation Failed

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

#### 9. Assessment Timer Not Working

**Issue:** Timer doesn't count down

**Solution:**
- Clear browser cache
- Check browser console for errors
- Ensure WebSocket connection is established
- Verify system time is correct

#### 10. File Upload Fails

**Error:** `File upload failed`

**Solution:**
- Check `MAX_FILE_SIZE` in .env
- Verify `public/project-documents/` directory exists
- Check file permissions
- Ensure file type is allowed in `ALLOWED_FILE_TYPES`

### Getting Help

If you encounter issues not covered here:

1. Check the console logs (both frontend and backend)
2. Review the error message carefully
3. Check database connection
4. Verify environment variables
5. Ensure all dependencies are installed
6. Try restarting both services

### Database Reset (Development Only)

If you need to completely reset the database:

```bash
cd backend-nextjs

# Reset database (deletes all data)
npx prisma migrate reset --force

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Apply all migrations
# 4. Run seed script (creates default users)
```

### Useful Commands

```bash
# Check backend logs
cd backend-nextjs
npm start

# Check frontend logs
cd frontend-angular
npm start

# Open database GUI
cd backend-nextjs
npm run db:studio

# Check database schema
cd backend-nextjs
npx prisma db pull

# Format Prisma schema
npx prisma format

# Generate TypeScript types from schema
npx prisma generate
```


#