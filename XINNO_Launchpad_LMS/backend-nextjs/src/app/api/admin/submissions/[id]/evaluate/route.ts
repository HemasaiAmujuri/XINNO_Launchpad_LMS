import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';
import { sendAssessmentReviewEmail } from '@/lib/email';

// PUT /api/admin/submissions/[id]/evaluate - Evaluate a submission (descriptive answers)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER', 'REVIEWER']);
    if (authUser instanceof NextResponse) return authUser;

    const attemptId = params.id;
    const body = await request.json();
    const { answers, remarks } = body; // answers: [{ answerId, marksAwarded, feedback }]

    // Check if attempt exists
    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        assessment: true,
      },
    });

    if (!attempt) {
      return errorResponse('Submission not found', 404);
    }

    if (attempt.status !== 'SUBMITTED') {
      return errorResponse('Submission is not in submitted state', 400);
    }

    // Update each answer with evaluation
    let totalObtainedMarks = 0;

    for (const answerEval of answers) {
      const answer = attempt.answers.find((a: any) => a.id === answerEval.answerId);
      if (!answer) continue;

      const marksAwarded = parseFloat(answerEval.marksAwarded) || 0;

      // Validate marks don't exceed question marks
      if (marksAwarded > answer.question.marks) {
        return errorResponse(
          `Marks awarded (${marksAwarded}) cannot exceed question marks (${answer.question.marks})`,
          400
        );
      }

      await prisma.answer.update({
        where: { id: answerEval.answerId },
        data: {
          marksAwarded,
          feedback: answerEval.feedback,
          evaluatedBy: authUser.userId,
          evaluatedAt: new Date(),
          autoEvaluated: false,
        },
      });

      totalObtainedMarks += marksAwarded;
    }

    // Calculate total obtained marks (including auto-evaluated MCQs)
    const allAnswers = await prisma.answer.findMany({
      where: { attemptId },
    });

    const finalObtainedMarks = allAnswers.reduce((sum: number, ans: any) => sum + ans.marksAwarded, 0);

    // Update attempt with final marks
    const updatedAttempt = await prisma.assessmentAttempt.update({
      where: { id: attemptId },
      data: {
        obtainedMarks: finalObtainedMarks,
        isPassed: finalObtainedMarks >= attempt.assessment.passingMarks,
        reviewedBy: authUser.userId,
        reviewedAt: new Date(),
        remarks,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            totalMarks: true,
            passingMarks: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // Get reviewer info separately
    const reviewer = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, name: true, email: true }
    });

    // 📧 Send email notification to student
    try {
      await sendAssessmentReviewEmail(
        updatedAttempt.student.email,
        updatedAttempt.student.name,
        updatedAttempt.assessment.title,
        finalObtainedMarks,
        updatedAttempt.assessment.totalMarks,
        updatedAttempt.assessment.passingMarks,
        updatedAttempt.isPassed,
        reviewer?.name || 'Reviewer',
        remarks
      );
      console.log('✅ Assessment review email sent to:', updatedAttempt.student.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send assessment review email:', emailError);
    }

    return successResponse(updatedAttempt, 'Submission evaluated successfully');
  } catch (error: any) {
    console.error('Error evaluating submission:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
