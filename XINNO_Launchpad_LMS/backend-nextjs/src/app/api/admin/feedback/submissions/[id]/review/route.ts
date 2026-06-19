import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// POST /api/admin/feedback/submissions/[id]/review - Add review to a submission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Allow ADMIN, TRAINER, and REVIEWER to add reviews
    if (authUser.role !== 'ADMIN' && authUser.role !== 'REVIEWER' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const body = await request.json();
    const { rating, comments } = body;

    // Check if submission exists
    const submission = await prisma.feedbackSubmission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return errorResponse('Submission not found', 404);
    }

    // Create review
    const review = await prisma.feedbackReview.create({
      data: {
        submissionId: params.id,
        reviewedBy: authUser.userId,
        rating: rating || null,
        comments: comments || null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(review, 'Review added successfully', 201);
  } catch (error: any) {
    console.error('Error adding review:', error);
    return errorResponse(error.message);
  }
}

// GET /api/admin/feedback/submissions/[id]/review - Get reviews for a submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Allow ADMIN, TRAINER, and REVIEWER to view reviews
    if (authUser.role !== 'ADMIN' && authUser.role !== 'REVIEWER' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const reviews = await prisma.feedbackReview.findMany({
      where: { submissionId: params.id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        reviewedAt: 'desc',
      },
    });

    return successResponse(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return errorResponse(error.message);
  }
}
