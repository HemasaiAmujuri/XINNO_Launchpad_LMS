import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// POST /api/feedback/[id]/submit - Submit feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const { responses } = body;

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return errorResponse('Responses are required');
    }

    // Check if form exists and is active
    const form = await prisma.feedbackForm.findUnique({
      where: { id: params.id },
      include: {
        questions: true,
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

    if (existingSubmission) {
      return errorResponse('You have already submitted feedback for this form');
    }

    // Validate responses
    const requiredQuestions = form.questions.filter((q: any) => q.isRequired);
    const responseQuestionIds = responses.map((r: any) => r.questionId);

    for (const question of requiredQuestions) {
      if (!responseQuestionIds.includes(question.id)) {
        return errorResponse(`Response for question "${question.questionText}" is required`);
      }
    }

    // Create submission with responses
    const submission = await prisma.feedbackSubmission.create({
      data: {
        formId: params.id,
        submittedBy: authUser.userId,
        responses: {
          create: responses.map((r: any) => ({
            questionId: r.questionId,
            responseText: r.responseText || '',
          })),
        },
      },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
      },
    });

    return successResponse(submission, 'Feedback submitted successfully', 201);
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return errorResponse(error.message);
  }
}
