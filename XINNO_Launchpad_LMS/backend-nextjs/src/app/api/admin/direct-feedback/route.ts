import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/direct-feedback - Get all direct feedbacks (admin, trainer & student view)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER', 'STUDENT']);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');
    const giverId = searchParams.get('giverId');

    const where: any = {};

    // Students can only see feedbacks they received
    if (authUser.role === 'STUDENT') {
      where.givenTo = authUser.userId;
    }
    // Trainers can only see feedbacks they gave or received
    else if (authUser.role === 'TRAINER') {
      where.OR = [
        { givenBy: authUser.userId },
        { givenTo: authUser.userId },
      ];
    }
    // Admins can see all, but can filter

    // Filter by specific recipient (if allowed)
    if (recipientId && authUser.role !== 'STUDENT') {
      where.givenTo = recipientId;
    }

    // Filter by specific giver (if allowed)
    if (giverId && authUser.role !== 'STUDENT') {
      where.givenBy = giverId;
    }

    const feedbacks = await prisma.directFeedback.findMany({
      where,
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            batchName: true,
            courseType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(feedbacks);
  } catch (error: any) {
    console.error('Error fetching direct feedbacks:', error);
    return errorResponse(error.message, 500);
  }
}

// POST /api/admin/direct-feedback - Create direct feedback
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    // Check if trainer has permission to give feedback
    if (authUser.role === 'TRAINER') {
      const trainer = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { canGiveFeedback: true }
      });

      if (!trainer?.canGiveFeedback) {
        return errorResponse('You do not have permission to give feedback. Please contact admin.', 403);
      }
    }

    const body = await request.json();
    const { recipientId, marks, maxMarks, comments, category } = body;

    // Validate required fields
    if (!recipientId || !comments) {
      return errorResponse('Recipient and comments are required', 400);
    }

    // Get recipient details
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { role: true },
    });

    if (!recipient) {
      return errorResponse('Recipient not found', 404);
    }

    // Cannot give feedback to admins
    if (recipient.role === 'ADMIN') {
      return errorResponse('Feedback cannot be given to admins', 403);
    }

    // Create feedback
    const feedback = await prisma.directFeedback.create({
      data: {
        givenBy: authUser.userId,
        givenTo: recipientId,
        marks: marks ? parseFloat(marks) : null,
        maxMarks: maxMarks ? parseFloat(maxMarks) : null,
        comments,
        category: category || 'GENERAL',
      },
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            batchName: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: feedback },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating direct feedback:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
