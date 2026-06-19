import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/feedback - Get all feedback forms
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'REVIEWER') {
      return errorResponse('Unauthorized access', 403);
    }

    const { searchParams } = new URL(request.url);
    const forRole = searchParams.get('forRole');
    const courseType = searchParams.get('courseType');
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (forRole) where.forRole = forRole;
    if (courseType) where.courseType = courseType;
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const forms = await prisma.feedbackForm.findMany({
      where,
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(forms);
  } catch (error: any) {
    console.error('Error fetching feedback forms:', error);
    return errorResponse(error.message);
  }
}

// POST /api/admin/feedback - Create a new feedback form
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized access', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      forRole,
      courseType,
      isActive,
      questions,
    } = body;

    // Validation
    if (!title || !forRole) {
      return errorResponse('Title and role are required');
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return errorResponse('At least one question is required');
    }

    // Create feedback form with questions
    const form = await prisma.feedbackForm.create({
      data: {
        title,
        description,
        forRole,
        courseType: courseType || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: authUser.userId,
        questions: {
          create: questions.map((q: any, index: number) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            isRequired: q.isRequired !== undefined ? q.isRequired : true,
            options: q.options || null,
            orderIndex: index,
          })),
        },
      },
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    return successResponse(form, 'Feedback form created successfully', 201);
  } catch (error: any) {
    console.error('Error creating feedback form:', error);
    return errorResponse(error.message);
  }
}
