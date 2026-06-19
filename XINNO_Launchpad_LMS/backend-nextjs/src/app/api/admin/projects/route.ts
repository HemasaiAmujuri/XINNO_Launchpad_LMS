import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';
import { sendProjectAssignmentEmail } from '@/lib/email';

// GET /api/admin/projects - Get all projects (Admin & Trainer view)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'TRAINER' && authUser.role !== 'REVIEWER') {
      return errorResponse('Unauthorized access', 403);
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const mentorId = searchParams.get('mentorId');
    const courseType = searchParams.get('courseType');
    const stage = searchParams.get('stage');
    const isCompleted = searchParams.get('isCompleted');

    const where: any = {};
    
    // Trainers can only see projects where they are mentor
    if (authUser.role === 'TRAINER') {
      where.mentorId = authUser.userId;
    }

    if (studentId) where.studentId = studentId;
    if (mentorId && authUser.role !== 'TRAINER') where.mentorId = mentorId;
    if (courseType) where.courseType = courseType;
    if (stage) where.currentStage = stage;
    if (isCompleted !== null && isCompleted !== undefined) {
      where.isCompleted = isCompleted === 'true';
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            batchName: true,
            courseType: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stageProgress: {
          orderBy: {
            stage: 'asc',
          },
        },
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return errorResponse(error.message);
  }
}

// POST /api/admin/projects - Create a new project (Admin & Trainer)
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      studentId,
      mentorId,
      courseType,
      startDate,
      endDate,
    } = body;

    // Validation
    if (!title || !description || !studentId || !mentorId || !courseType || !startDate || !endDate) {
      return errorResponse('Missing required fields');
    }

    // Verify student exists and has correct role
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      return errorResponse('Invalid student');
    }

    // Verify mentor exists and has correct role
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || (mentor.role !== 'TRAINER' && mentor.role !== 'ADMIN')) {
      return errorResponse('Invalid mentor');
    }

    // Check if student already has an active project for this course type
    const existingProject = await prisma.project.findFirst({
      where: {
        studentId,
        courseType,
        isCompleted: false,
      },
    });

    if (existingProject) {
      return errorResponse('Student already has an active project for this course type');
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        studentId,
        mentorId,
        courseType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        currentStage: 'PROBLEM_STATEMENT',
        completionPercent: 0,
        isCompleted: false,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            batchName: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stageProgress: true,
      },
    });

    // Initialize all project stages
    const stages = [
      'PROBLEM_STATEMENT',
      'REQUIREMENT_ANALYSIS',
      'DESIGN_ARCHITECTURE',
      'DEVELOPMENT',
      'TESTING_VALIDATION',
      'DOCUMENTATION',
      'FINAL_DEMO_REVIEW',
    ];

    await Promise.all(
      stages.map((stage) =>
        prisma.projectStageProgress.create({
          data: {
            projectId: project.id,
            stage: stage as any,
            status: stage === 'PROBLEM_STATEMENT' ? 'IN_PROGRESS' : 'PENDING',
            startDate: stage === 'PROBLEM_STATEMENT' ? new Date() : null,
          },
        })
      )
    );

    // 📧 Send email notification to student
    try {
      await sendProjectAssignmentEmail(
        project.student.email,
        project.student.name,
        project.title,
        project.mentor.name,
        new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      );
      console.log('✅ Project assignment email sent to:', project.student.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send project assignment email:', emailError);
      // Don't fail the request if email fails
    }

    return successResponse(project, 'Project created successfully', 201);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return errorResponse(error.message);
  }
}
