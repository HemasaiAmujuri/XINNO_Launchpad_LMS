import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/feedback/[id]/submissions - Get all submissions for a form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Allow ADMIN, TRAINER, and REVIEWER to view feedback submissions
    if (authUser.role !== 'ADMIN' && authUser.role !== 'REVIEWER' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where: any = {
      formId: params.id,
    };

    if (userId) {
      where.submittedBy = userId;
    }

    const submissions = await prisma.feedbackSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            batchName: true,
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
