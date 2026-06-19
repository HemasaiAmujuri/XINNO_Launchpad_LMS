# OraXinno LMS - Complete Setup Guide

## 🎯 Project Overview

A comprehensive Learning Management System with:
- ✅ **Next.js 14 Backend** - REST API with auto-database setup
- ✅ **Angular 17 Frontend** - Modern UI with the specified design
- ✅ **PostgreSQL Database** - Auto-migration & seeding
- ✅ **JWT Authentication** - Role-based access control
- ✅ **Assessment Module** - MCQ + Descriptive questions with timer
- ✅ **Project Tracking** - 7-stage progress monitoring
- ✅ **Feedback System** - Dynamic forms with reviews

## 🎨 Design Specifications

- **Background Color**: `#000786` (Deep Blue)
- **Text Color**: White on colored backgrounds, Black on white cards
- **Font Family**: Poppins (Tiffany & Co inspired)
- **Logo**: http://oraxinno.com/img/logo_oraXinno.png

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** 18+ ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- ✅ **npm** or **yarn**
- ✅ **Git** (optional)

### Check Prerequisites

```bash
node -v    # Should show v18 or higher
npm -v     # Should show npm version
psql --version  # Should show PostgreSQL version
```

## 🚀 Quick Start (Recommended)

### Step 1: Setup Database

```bash
# Create PostgreSQL database
createdb oraxinno_lms

# Or using psql
psql -U postgres
CREATE DATABASE oraxinno_lms;
\q
```

### Step 2: Setup Backend (Next.js)

```bash
cd backend-nextjs

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Update .env with your database credentials:
# DATABASE_URL="postgresql://username:password@localhost:5432/oraxinno_lms?schema=public"

# Run automatic setup (creates tables & seeds data)
chmod +x setup.sh
./setup.sh

# OR manually:
npm run db:setup
npm run db:seed

# Start backend server
npm run dev
```

**Backend will run on: http://localhost:3001**

### Step 3: Setup Frontend (Angular)

```bash
# Open new terminal
cd frontend-angular

# Install dependencies
npm install

# Install Angular CLI globally (if not installed)
npm install -g @angular/cli

# Start frontend server
npm start
```

**Frontend will run on: http://localhost:4200**

## 🔑 Default Login Credentials

| Role     | Email                     | Password     |
|----------|---------------------------|--------------|
| Admin    | admin@oraxinno.com        | Admin@123    |
| Trainer  | trainer@oraxinno.com      | Trainer@123  |
| Reviewer | reviewer@oraxinno.com     | Reviewer@123 |
| Student  | student@oraxinno.com      | Student@123  |

## 📁 Project Structure

```
oraxinnolms/
├── backend-nextjs/           # Next.js API Backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (auto-creates tables)
│   │   └── seed.ts          # Initial data
│   ├── src/
│   │   ├── app/api/         # API routes
│   │   │   ├── auth/        # Authentication
│   │   │   ├── users/       # User management
│   │   │   ├── assessments/ # Online tests
│   │   │   ├── projects/    # Project tracking
│   │   │   └── feedback/    # Feedback forms
│   │   └── lib/
│   │       ├── prisma.ts    # Database client
│   │       ├── auth.ts      # JWT & authentication
│   │       └── validations.ts # Zod schemas
│   ├── package.json
│   ├── setup.sh             # Auto-setup script
│   └── .env.example
│
└── frontend-angular/         # Angular 17 Frontend
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── services/    # API services
    │   │   │   ├── guards/      # Route guards
    │   │   │   ├── interceptors/# HTTP interceptors
    │   │   │   └── models/      # TypeScript interfaces
    │   │   └── features/
    │   │       ├── auth/        # Login
    │   │       ├── dashboard/   # Dashboard
    │   │       ├── assessments/ # Assessment module
    │   │       ├── projects/    # Project tracking
    │   │       ├── feedback/    # Feedback forms
    │   │       └── admin/       # Admin panel
    │   ├── styles.css           # Global styles with design
    │   └── environments/
    ├── angular.json
    └── package.json
```

## 🎯 Features Implementation

### ✅ Module 1: Online Assessment System

**Student Features:**
- View available assessments
- Take timed assessments (15 minutes default)
- Answer MCQ and descriptive questions
- Auto-save answers
- Auto-submit on time completion
- No page refresh allowed (handled by Angular)

**Admin Features:**
- Create/Edit/Delete assessments
- Add questions (MCQ/Descriptive)
- Set marks, difficulty level, time limits
- Publish/Unpublish assessments
- Review student answers
- Manual evaluation for descriptive answers
- Auto-evaluation for MCQs

### ✅ Module 2: Project Progress Tracking

**Student Features:**
- View assigned projects
- See current stage and completion percentage
- Update daily/weekly progress
- View mentor remarks
- Upload project documents

**Admin/Mentor Features:**
- Create new projects
- Assign students and mentors
- Track progress across 7 stages:
  1. Problem Statement Finalization
  2. Requirement Analysis
  3. Design & Architecture
  4. Development Phase
  5. Testing & Validation
  6. Documentation
  7. Final Demo & Review
- Add mentor remarks
- Approve stage completion
- View project timeline

### ✅ Module 3: Feedback System

**Features:**
- Create dynamic feedback forms
- Multiple question types (Text, Rating, MCQ, Checkbox)
- Role-based forms (Student/Trainer)
- Submit feedback responses
- Admin review panel
- View aggregated responses

## 🛠️ Development Commands

### Backend Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:setup         # Setup & migrate database
npm run db:seed          # Seed initial data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (⚠️ deletes all data)

# Production
npm run build            # Build for production
npm start                # Start production server
```

### Frontend Commands

```bash
# Development
npm start                # Start dev server (port 4200)
ng serve                 # Alternative command

# Build
ng build                 # Build for production
ng build --watch         # Build with watch mode

# Testing
ng test                  # Run unit tests

# Generate components
ng generate component features/component-name
```

## 📊 Database Tables (Auto-Created)

The database schema includes these tables (automatically created):

- ✅ `User` - All users (Admin, Trainer, Reviewer, Student)
- ✅ `Assessment` - Assessments/Tests
- ✅ `Question` - Test questions
- ✅ `AssessmentAttempt` - Student attempts
- ✅ `Answer` - Student answers
- ✅ `Project` - Academic projects
- ✅ `ProjectStageProgress` - Stage tracking
- ✅ `ProjectDocument` - Uploaded files
- ✅ `FeedbackForm` - Feedback forms
- ✅ `FeedbackQuestion` - Form questions
- ✅ `FeedbackSubmission` - Student responses
- ✅ `FeedbackResponse` - Individual answers
- ✅ `FeedbackReview` - Admin reviews

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Assessments
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create assessment (Admin/Trainer)
- `POST /api/assessments/start` - Start assessment (Student)
- `POST /api/assessments/submit` - Submit assessment (Student)
- `POST /api/assessments/:id/questions` - Add questions

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id/stage` - Update stage

### Feedback
- `GET /api/feedback/forms` - List forms
- `POST /api/feedback/forms` - Create form
- `POST /api/feedback/submit` - Submit feedback

## 🎨 Color Scheme & Styling

```css
/* Primary Colors */
--primary-color: #000786;     /* Background */
--text-white: #ffffff;        /* White text */
--text-black: #000000;        /* Black text on cards */

/* Font */
font-family: 'Poppins', sans-serif;
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL (macOS)
brew services restart postgresql

# Check connection
psql -U postgres -d oraxinno_lms
```

### Port Already in Use

```bash
# Backend (change port)
npm run dev -- -p 3002

# Frontend (change port)
ng serve --port 4201
```

### Clear Browser Storage

If login issues occur:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Clear all data
4. Refresh page

### Reset Database

```bash
cd backend-nextjs
npm run db:reset
npm run db:seed
```

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/oraxinno_lms?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:4200"
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
```

## 🚀 Production Deployment

### Backend

```bash
cd backend-nextjs
npm run build
npm start
```

### Frontend

```bash
cd frontend-angular
ng build --configuration production
# Deploy dist/ folder to your hosting
```

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Angular Documentation](https://angular.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error messages carefully
3. Ensure all prerequisites are installed
4. Verify database connection
5. Check that both servers are running

## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend server starts without errors on port 3001
✅ Frontend loads on http://localhost:4200
✅ Login page displays with OraXinno logo
✅ You can login with demo credentials
✅ Dashboard loads after login
✅ Database has all tables and seed data

---

**Made with ❤️ for OraXinno Academy**
