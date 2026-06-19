import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// POST /api/assessments/[id]/save-answer - Auto-save answer during assessment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['STUDENT']);
    if (authUser instanceof NextResponse) return authUser;

    const assessmentId = params.id;
    const body = await request.json();
    const { questionId, answerText } = body;

    // Get the active attempt
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        assessmentId,
        studentId: authUser.userId,
        status: 'IN_PROGRESS',
      },
    });

    if (!attempt) {
      return errorResponse('No active attempt found', 404);
    }

    // Save or update the answer
    const answer = await prisma.answer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: attempt.id,
          questionId,
        },
      },
      create: {
        attemptId: attempt.id,
        questionId,
        answerText,
      },
      update: {
        answerText,
        updatedAt: new Date(),
      },
    });

    // Update time spent
    if (attempt.startedAt) {
      const timeSpentSeconds = Math.floor(
        (new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000
      );
      
      await prisma.assessmentAttempt.update({
        where: { id: attempt.id },
        data: { timeSpentSeconds },
      });
    }

    return successResponse({
      answer,
      message: 'Answer saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving answer:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
