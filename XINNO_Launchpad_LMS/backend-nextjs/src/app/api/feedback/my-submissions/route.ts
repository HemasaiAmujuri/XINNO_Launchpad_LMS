import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/feedback/my-submissions - Get user's own feedback submissions
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const submissions = await prisma.feedbackSubmission.findMany({
      where: {
        submittedBy: authUser.userId,
      },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            description: true,
            forRole: true,
            courseType: true,
          },
        },
        responses: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                options: true,
              },
            },
          },
          orderBy: {
            question: {
              orderIndex: 'asc',
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return successResponse(submissions);
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    return errorResponse(error.message);
  }
}
