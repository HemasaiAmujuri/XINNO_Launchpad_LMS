import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/feedback/[id] - Get feedback form by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const form = await prisma.feedbackForm.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!form) {
      return errorResponse('Feedback form not found', 404);
    }

    if (!form.isActive) {
      return errorResponse('This feedback form is no longer active', 400);
    }

    // Check if user has already submitted
    const existingSubmission = await prisma.feedbackSubmission.findUnique({
      where: {
        formId_submittedBy: {
          formId: params.id,
          submittedBy: authUser.userId,
        },
      },
    });

    return successResponse({
      ...form,
      hasSubmitted: !!existingSubmission,
    });
  } catch (error: any) {
    console.error('Error fetching feedback form:', error);
    return errorResponse(error.message);
  }
}
