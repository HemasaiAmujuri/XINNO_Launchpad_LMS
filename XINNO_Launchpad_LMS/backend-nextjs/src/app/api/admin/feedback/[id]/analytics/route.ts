import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/feedback/[id]/analytics - Get analytics for a feedback form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'REVIEWER') {
      return errorResponse('Unauthorized access', 403);
    }

    // Check if form exists
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

    // Get all submissions
    const submissions = await prisma.feedbackSubmission.findMany({
      where: { formId: params.id },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            batchName: true,
            courseType: true,
          },
        },
      },
    });

    // Calculate analytics
    const analytics = {
      totalSubmissions: submissions.length,
      submissionsByBatch: {} as Record<string, number>,
      submissionsByCourseType: {} as Record<string, number>,
      questionAnalytics: form.questions.map((question: any) => {
        const responses = submissions.flatMap((s: any) =>
          s.responses.filter((r: any) => r.questionId === question.id)
        );

        const analytics: any = {
          questionId: question.id,
          questionText: question.questionText,
          questionType: question.questionType,
          totalResponses: responses.length,
        };

        // For MCQ questions, calculate option distribution
        if (question.questionType === 'MCQ' && question.options) {
          const options = question.options as any;
          analytics.optionDistribution = {};

          responses.forEach((response: any) => {
            const answer = response.responseText;
            if (!analytics.optionDistribution[answer]) {
              analytics.optionDistribution[answer] = 0;
            }
            analytics.optionDistribution[answer]++;
          });
        }

        // For text questions, provide sample responses
        if (question.questionType === 'TEXT' || question.questionType === 'TEXTAREA') {
          analytics.sampleResponses = responses.slice(0, 5).map((r: any) => ({
            response: r.responseText,
            submittedBy: submissions.find((s: any) => s.responses.some((res: any) => res.id === r.id))?.user.name,
          }));
        }

        return analytics;
      }),
    };

    // Calculate submissions by batch
    submissions.forEach((submission: any) => {
      const batch = submission.user.batchName || 'N/A';
      analytics.submissionsByBatch[batch] = (analytics.submissionsByBatch[batch] || 0) + 1;
    });

    // Calculate submissions by course type
    submissions.forEach((submission: any) => {
      const courseType = submission.user.courseType || 'N/A';
      analytics.submissionsByCourseType[courseType] = (analytics.submissionsByCourseType[courseType] || 0) + 1;
    });

    return successResponse(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return errorResponse(error.message);
  }
}
