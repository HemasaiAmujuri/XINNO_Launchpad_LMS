import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/assessments/[id]/questions - Get assessment questions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const assessmentId = params.id;

    // Check if assessment exists and is published
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!assessment) {
      return errorResponse('Assessment not found', 404);
    }

    if (!assessment.isPublished && authUser.role === 'STUDENT') {
      return errorResponse('Assessment not available', 403);
    }

    // Check if student has an active attempt
    let attempt = null;
    if (authUser.role === 'STUDENT') {
      attempt = await prisma.assessmentAttempt.findFirst({
        where: {
          assessmentId,
          studentId: authUser.userId,
          status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
        },
      });

      if (!attempt) {
        return errorResponse('No active attempt found. Please start the assessment first.', 403);
      }
    }

    // Format questions - hide correct answers for students
    const formattedQuestions = assessment.questions.map((q: any) => {
      const question: any = {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        orderIndex: q.orderIndex,
        characterLimit: q.characterLimit,
      };

      // For MCQ, include options but not correct answer
      if (q.questionType === 'MCQ' && q.options) {
        question.options = q.options;
        
        // Only show correct answer to admin/trainer
        if (authUser.role !== 'STUDENT') {
          question.correctAnswer = q.correctAnswer;
        }
      }

      return question;
    });

    return successResponse({
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        courseType: assessment.courseType,
        totalMarks: assessment.totalMarks,
        timeLimitMinutes: assessment.timeLimitMinutes,
        instructions: assessment.instructions,
        totalQuestions: formattedQuestions.length,
      },
      questions: formattedQuestions,
      attempt: attempt
        ? {
            id: attempt.id,
            startedAt: attempt.startedAt,
            timeSpentSeconds: attempt.timeSpentSeconds,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching assessment questions:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
