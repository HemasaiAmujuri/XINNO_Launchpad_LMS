import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/feedback/[id] - Get feedback form by ID
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

    const form = await prisma.feedbackForm.findUnique({
      where: { id: params.id },
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      return errorResponse('Feedback form not found', 404);
    }

    return successResponse(form);
  } catch (error: any) {
    console.error('Error fetching feedback form:', error);
    return errorResponse(error.message);
  }
}

// PUT /api/admin/feedback/[id] - Update feedback form
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized access', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      forRole,
      courseType,
      isActive,
      questions,
    } = body;

    // Check if form exists
    const existingForm = await prisma.feedbackForm.findUnique({
      where: { id: params.id },
      include: {
        submissions: true,
      },
    });

    if (!existingForm) {
      return errorResponse('Feedback form not found', 404);
    }

    // If there are submissions, only allow updating title, description, and isActive
    if (existingForm.submissions.length > 0 && questions) {
      return errorResponse('Cannot modify questions for a form that has submissions');
    }

    // Update form
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (forRole !== undefined) updateData.forRole = forRole;
    if (courseType !== undefined) updateData.courseType = courseType;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If questions are provided and no submissions exist, update them
    if (questions && existingForm.submissions.length === 0) {
      // Delete existing questions
      await prisma.feedbackQuestion.deleteMany({
        where: { formId: params.id },
      });

      // Create new questions
      updateData.questions = {
        create: questions.map((q: any, index: number) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          isRequired: q.isRequired !== undefined ? q.isRequired : true,
          options: q.options || null,
          orderIndex: index,
        })),
      };
    }

    const form = await prisma.feedbackForm.update({
      where: { id: params.id },
      data: updateData,
      include: {
        questions: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return successResponse(form, 'Feedback form updated successfully');
  } catch (error: any) {
    console.error('Error updating feedback form:', error);
    return errorResponse(error.message);
  }
}

// DELETE /api/admin/feedback/[id] - Delete feedback form
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized access', 403);
    }

    const form = await prisma.feedbackForm.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!form) {
      return errorResponse('Feedback form not found', 404);
    }

    // Prevent deletion if there are submissions
    if (form._count.submissions > 0) {
      return errorResponse('Cannot delete a form that has submissions. Consider deactivating it instead.');
    }

    await prisma.feedbackForm.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Feedback form deleted successfully');
  } catch (error: any) {
    console.error('Error deleting feedback form:', error);
    return errorResponse(error.message);
  }
}
