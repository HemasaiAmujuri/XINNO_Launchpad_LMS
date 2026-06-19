import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError, requireAuth } from '@/lib/auth';

// GET /api/assessments/:id - Get single assessment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });

    if (!assessment) {
      return errorResponse('Assessment not found', 404);
    }

    return successResponse(assessment);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/assessments/:id - Update assessment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (auth instanceof Response) return auth;

    const body = await request.json();

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findUnique({
      where: { id: params.id },
    });

    if (!existingAssessment) {
      return errorResponse('Assessment not found', 404);
    }

    // Map frontend field names to backend schema
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.courseLevel || body.courseType) {
      const courseType = body.courseLevel || body.courseType;
      const validCourseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'];
      const upperCourseType = courseType.toUpperCase();
      if (validCourseTypes.includes(upperCourseType)) {
        updateData.courseType = upperCourseType;
      } else {
        return errorResponse(`Invalid courseType. Must be one of: ${validCourseTypes.join(', ')}`, 400);
      }
    }
    if (body.batchName !== undefined) updateData.batchName = body.batchName;
    if (body.totalMarks) updateData.totalMarks = body.totalMarks;
    if (body.passingMarks) updateData.passingMarks = body.passingMarks;
    if (body.timeLimit || body.timeLimitMinutes) {
      updateData.timeLimitMinutes = body.timeLimit || body.timeLimitMinutes;
    }
    if (body.instructions !== undefined) updateData.instructions = body.instructions;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.allowReAttempt !== undefined) updateData.allowReAttempt = body.allowReAttempt;
    if (body.showResults !== undefined) updateData.showResults = body.showResults;

    const assessment = await prisma.assessment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        questions: {
          where: { isActive: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // If questionIds are provided, update question assignments
    if (body.questionIds && Array.isArray(body.questionIds)) {
      // Get current questions linked to this assessment
      const currentQuestions = await prisma.question.findMany({
        where: { assessmentId: params.id },
        select: { id: true }
      });
      
      const currentQuestionIds = currentQuestions.map((q: { id: string }) => q.id);
      const newQuestionIds = body.questionIds;
      
      // Find questions to unlink (in current but not in new)
      const questionsToUnlink = currentQuestionIds.filter((id: string) => !newQuestionIds.includes(id));
      
      // Find questions to link (in new but not in current)
      const questionsToLink = newQuestionIds.filter((id: string) => !currentQuestionIds.includes(id));
      
      // Find or create a "Question Bank" assessment for unlinked questions
      if (questionsToUnlink.length > 0) {
        let questionBankAssessment = await prisma.assessment.findFirst({
          where: { title: 'Question Bank' }
        });

        if (!questionBankAssessment) {
          questionBankAssessment = await prisma.assessment.create({
            data: {
              title: 'Question Bank',
              description: 'General question bank for reusable questions',
              courseType: 'FULL_STACK',
              totalMarks: 0,
              passingMarks: 0,
              timeLimitMinutes: 0,
              isPublished: false,
              createdBy: auth.userId,
            }
          });
        }

        // Move unlinked questions to Question Bank
        await prisma.question.updateMany({
          where: { id: { in: questionsToUnlink } },
          data: { assessmentId: questionBankAssessment.id }
        });
      }
      
      // Link new questions to this assessment
      if (questionsToLink.length > 0) {
        await prisma.question.updateMany({
          where: { id: { in: questionsToLink } },
          data: { assessmentId: params.id }
        });
      }
    }

    return successResponse(assessment, 'Assessment updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/assessments/:id - Delete assessment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request, ['ADMIN']);
    if (auth instanceof Response) return auth;

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: { attempts: true },
    });

    if (!assessment) {
      return errorResponse('Assessment not found', 404);
    }

    // Don't allow deletion if there are attempts
    if (assessment.attempts.length > 0) {
      return errorResponse('Cannot delete assessment with existing attempts', 403);
    }

    await prisma.assessment.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Assessment deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
