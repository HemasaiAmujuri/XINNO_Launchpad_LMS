# OraXinno LMS Backend - Setup Instructions

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Quick Setup (Automatic)

Run the setup script to automatically install dependencies and configure the database:

```bash
chmod +x setup.sh
./setup.sh
```

## Manual Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update database credentials:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/oraxinno_lms?schema=public"
```

### 3. Database Setup

The database will be automatically created with all tables when you run:

```bash
# Generate Prisma Client
npm run db:setup

# Seed initial data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Backend will run on: **http://localhost:3001**

## Default Login Credentials

After seeding, use these credentials:

| Role     | Email                     | Password     |
|----------|---------------------------|--------------|
| Admin    | admin@oraxinno.com        | Admin@123    |
| Trainer  | trainer@oraxinno.com      | Trainer@123  |
| Reviewer | reviewer@oraxinno.com     | Reviewer@123 |
| Student  | student@oraxinno.com      | Student@123  |

## Database Commands

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database (⚠️ deletes all data)
npm run db:reset

# Create new migration
npx prisma migrate dev --name migration_name
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Assessments
- `GET /api/assessments` - Get all assessments
- `POST /api/assessments` - Create assessment (Admin/Trainer)
- `POST /api/assessments/start` - Start assessment (Student)
- `POST /api/assessments/submit` - Submit assessment (Student)

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id/stage` - Update project stage

### Feedback
- `GET /api/feedback/forms` - Get feedback forms
- `POST /api/feedback/submit` - Submit feedback

## Features

✅ **Auto Database Setup** - Tables created automatically on first run
✅ **JWT Authentication** - Secure token-based auth
✅ **Role-Based Access** - Admin, Trainer, Reviewer, Student roles
✅ **Validation** - Zod schema validation on all endpoints
✅ **Auto-migrations** - Database schema updates automatically
✅ **Seed Data** - Initial users and sample data included
✅ **CORS Enabled** - Ready for Angular frontend

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### Port already in use
Change port in package.json or use:
```bash
next dev -p 3002
```

### Database connection issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb oraxinno_lms`

### Prisma Client errors
Regenerate Prisma Client:
```bash
npx prisma generate
```
