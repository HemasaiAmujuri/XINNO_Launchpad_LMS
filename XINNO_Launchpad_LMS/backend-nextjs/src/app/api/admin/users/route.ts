import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - Get all users (students and trainers)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // Filter by role
    const batch = searchParams.get('batch'); // Filter by batch

    const where: any = {};
    
    if (role) {
      where.role = role;
    } else {
      // By default, show only STUDENT and TRAINER roles
      where.role = { in: ['STUDENT', 'TRAINER'] };
    }
    
    if (batch) {
      where.batchName = batch;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        courseType: true,
        courseLevel: true,
        batchName: true,
        isActive: true,
        canGiveFeedback: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assessmentAttempts: true,
            feedbackSubmissions: true,
            projects: true,
            mentorProjects: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    return successResponse(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return errorResponse(error.message, 500);
  }
}

// POST /api/admin/users/create-trainer - Create a new trainer
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN']);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const { name, email, password, courseType, courseLevel } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse('Name, email, and password are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 400);
    }

    // Validate courseType if provided
    const validCourseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'];
    if (courseType && !validCourseTypes.includes(courseType)) {
      return errorResponse(`Invalid courseType. Valid values are: ${validCourseTypes.join(', ')}`, 400);
    }

    // Validate courseLevel if provided
    const validCourseLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (courseLevel && !validCourseLevels.includes(courseLevel)) {
      return errorResponse(`Invalid courseLevel. Valid values are: ${validCourseLevels.join(', ')}`, 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create trainer
    const trainer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TRAINER',
        courseType: courseType || null,
        courseLevel: courseLevel || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        courseType: true,
        courseLevel: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, data: trainer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating trainer:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
