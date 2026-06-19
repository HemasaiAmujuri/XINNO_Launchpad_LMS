import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError, requireAuth } from '@/lib/auth';
import { startAssessmentSchema } from '@/lib/validations';

// POST /api/assessments/start - Start an assessment
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['STUDENT']);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { assessmentId, accessPin } = body;

    if (!assessmentId) {
      return errorResponse('Assessment ID is required', 400);
    }

    // Check if assessment exists and is published
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } } },
    });

    if (!assessment) {
      return errorResponse('Assessment not found', 404);
    }

    if (!assessment.isPublished) {
      return errorResponse('Assessment is not published yet', 403);
    }

    // Verify PIN if assessment has one
    console.log('🔐 PIN Check:', {
      assessmentTitle: assessment.title,
      hasPin: !!assessment.accessPin,
      pinInDB: assessment.accessPin ? '****' : 'none',
      pinProvided: accessPin ? '****' : 'none',
      pinMatch: assessment.accessPin === accessPin
    });

    if (assessment.accessPin) {
      if (!accessPin) {
        console.log('❌ PIN required but not provided');
        return errorResponse('Access PIN is required for this assessment', 403);
      }
      if (accessPin !== assessment.accessPin) {
        console.log('❌ Wrong PIN provided');
        return errorResponse('Incorrect PIN. Please try again.', 403);
      }
      console.log('✅ PIN verified successfully');
    }

    // Check existing attempt
    const existingAttempt = await prisma.assessmentAttempt.findUnique({
      where: {
        assessmentId_studentId: {
          assessmentId,
          studentId: auth.userId,
        },
      },
    });

    if (existingAttempt) {
      if (existingAttempt.status === 'SUBMITTED') {
        if (!assessment.allowReAttempt) {
          return errorResponse('You have already submitted this assessment', 403);
        }
        // Allow re-attempt - create new attempt
      } else if (existingAttempt.status === 'IN_PROGRESS') {
        // Return existing attempt
        return successResponse({
          attempt: existingAttempt,
          assessment: {
            id: assessment.id,
            title: assessment.title,
            description: assessment.description,
            timeLimitMinutes: assessment.timeLimitMinutes,
            totalMarks: assessment.totalMarks,
            passingMarks: assessment.passingMarks,
            instructions: assessment.instructions,
          },
          questions: assessment.questions.map((q: any) => ({
            id: q.id,
            questionText: q.questionText,
            questionType: q.questionType,
            marks: q.marks,
            orderIndex: q.orderIndex,
            options: q.options,
            characterLimit: q.characterLimit,
          })),
        });
      }
    }

    // Create new attempt
    const attempt = await prisma.assessmentAttempt.create({
      data: {
        assessmentId,
        studentId: auth.userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        totalMarks: assessment.totalMarks,
      },
    });

    return successResponse({
      attempt,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        timeLimitMinutes: assessment.timeLimitMinutes,
        totalMarks: assessment.totalMarks,
        passingMarks: assessment.passingMarks,
        instructions: assessment.instructions,
      },
      questions: assessment.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        orderIndex: q.orderIndex,
        options: q.options,
        characterLimit: q.characterLimit,
      })),
    }, 'Assessment started successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message);
    }
    return handleApiError(error);
  }
}
