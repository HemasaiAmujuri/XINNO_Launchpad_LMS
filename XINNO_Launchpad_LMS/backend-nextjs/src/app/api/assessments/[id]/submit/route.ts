import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// POST /api/assessments/[id]/submit - Submit assessment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['STUDENT']);
    if (authUser instanceof NextResponse) return authUser;

    const assessmentId = params.id;
    const body = await request.json();
    const { answers, isAutoSubmit = false } = body;

    // Get the active attempt
    const attempt = await prisma.assessmentAttempt.findFirst({
      where: {
        assessmentId,
        studentId: authUser.userId,
        status: 'IN_PROGRESS',
      },
      include: {
        assessment: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return errorResponse('No active attempt found', 404);
    }

    // Process all answers
    let totalMarks = 0;
    let obtainedMarks = 0;

    for (const answerData of answers) {
      const question = attempt.assessment.questions.find((q: any) => q.id === answerData.questionId);
      if (!question) continue;

      totalMarks += question.marks;

      let isCorrect = false;
      let marksAwarded = 0;
      let autoEvaluated = false;

      // Auto-evaluate MCQ questions
      if (question.questionType === 'MCQ') {
        isCorrect = answerData.answerText === question.correctAnswer;
        marksAwarded = isCorrect ? question.marks : 0;
        autoEvaluated = true;
        obtainedMarks += marksAwarded;
      }

      // Create or update answer
      await prisma.answer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: attempt.id,
            questionId: answerData.questionId,
          },
        },
        create: {
          attemptId: attempt.id,
          questionId: answerData.questionId,
          answerText: answerData.answerText,
          isCorrect: autoEvaluated ? isCorrect : null,
          marksAwarded,
          autoEvaluated,
        },
        update: {
          answerText: answerData.answerText,
          isCorrect: autoEvaluated ? isCorrect : null,
          marksAwarded,
          autoEvaluated,
          updatedAt: new Date(),
        },
      });
    }

    // Calculate time spent
    const timeSpentSeconds = attempt.startedAt
      ? Math.floor((new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      : 0;

    // Update attempt status
    const updatedAttempt = await prisma.assessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        timeSpentSeconds,
        totalMarks,
        obtainedMarks,
        isPassed: obtainedMarks >= attempt.assessment.passingMarks,
        isAutoSubmitted: isAutoSubmit,
      },
      include: {
        answers: true,
      },
    });

    return successResponse({
      attempt: updatedAttempt,
      message: 'Assessment submitted successfully',
    });
  } catch (error: any) {
    console.error('Error submitting assessment:', error);
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
