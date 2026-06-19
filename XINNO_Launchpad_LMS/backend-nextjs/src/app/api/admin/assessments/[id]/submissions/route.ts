import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/assessments/[id]/submissions - Get all submissions for an assessment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER', 'REVIEWER']);
    if (authUser instanceof NextResponse) return authUser;

    const assessmentId = params.id;

    const submissions = await prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        status: 'SUBMITTED',
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            batchName: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                marks: true,
                correctAnswer: true,
                sampleAnswer: true,
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
