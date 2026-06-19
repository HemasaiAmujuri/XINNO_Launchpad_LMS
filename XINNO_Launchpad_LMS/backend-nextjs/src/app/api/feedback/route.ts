import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/feedback - Get available feedback forms for student
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Get forms for the user's role and course type
    const where: any = {
      isActive: true,
    };

    if (authUser.role === 'STUDENT') {
      // 🔥 Get student's courseType from registration
      const student = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: { courseType: true }
      });

      where.OR = [
        { forRole: 'STUDENT' },
        { forRole: authUser.role },
      ];

      // Filter by student's courseType
      if (student?.courseType) {
        where.courseType = student.courseType;
      }
    } else {
      where.forRole = authUser.role;
    }

    const forms = await prisma.feedbackForm.findMany({
      where,
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        submissions: {
          where: {
            submittedBy: authUser.userId,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add flag to indicate if user has already submitted
    const formsWithSubmissionStatus = forms.map((form: any) => ({
      ...form,
      hasSubmitted: form.submissions.length > 0,
      submissions: undefined, // Remove submissions array
    }));

    return successResponse(formsWithSubmissionStatus);
  } catch (error: any) {
    console.error('Error fetching feedback forms:', error);
    return errorResponse(error.message);
  }
}
