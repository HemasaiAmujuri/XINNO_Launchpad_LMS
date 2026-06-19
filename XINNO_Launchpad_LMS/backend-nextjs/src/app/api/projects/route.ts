import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/projects - Get projects (student view or admin view)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where: any = {};

    // Students can only see their own projects
    if (authUser.role === 'STUDENT') {
      where.studentId = authUser.userId;
    } else if (authUser.role === 'TRAINER') {
      // Trainers see projects they mentor
      where.mentorId = authUser.userId;
    } else if (studentId && (authUser.role === 'ADMIN' || authUser.role === 'REVIEWER')) {
      // Admin/Reviewer can filter by student
      where.studentId = studentId;
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
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return errorResponse(error.message, 500);
  }
}

// POST /api/projects - Create new project (Admin/Trainer)
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

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

    // Validate required fields
    if (!title || !description || !studentId || !mentorId || !courseType || !startDate || !endDate) {
      return errorResponse('Missing required fields', 400);
    }

    // Create project with all 7 stages
    const project = await prisma.project.create({
      data: {
        title,
        description,
        studentId,
        mentorId,
        courseType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        stageProgress: {
          create: [
            { stage: 'PROBLEM_STATEMENT', status: 'IN_PROGRESS' },
            { stage: 'REQUIREMENT_ANALYSIS', status: 'PENDING' },
            { stage: 'DESIGN_ARCHITECTURE', status: 'PENDING' },
            { stage: 'DEVELOPMENT', status: 'PENDING' },
            { stage: 'TESTING_VALIDATION', status: 'PENDING' },
            { stage: 'DOCUMENTATION', status: 'PENDING' },
            { stage: 'FINAL_DEMO_REVIEW', status: 'PENDING' },
          ],
        },
      },
      include: {
        stageProgress: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(project, 'Project created successfully', 201);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
