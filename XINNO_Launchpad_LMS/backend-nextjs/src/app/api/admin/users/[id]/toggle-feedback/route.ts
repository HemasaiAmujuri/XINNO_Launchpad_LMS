import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// PATCH /api/admin/users/[id]/toggle-feedback - Toggle trainer's feedback permission
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Toggle feedback request received for user:', params.id);
    console.log('Authorization header:', request.headers.get('authorization'));
    
    const authUser = requireAuth(request, ['ADMIN']);
    if (authUser instanceof NextResponse) {
      console.log('Auth failed, returning error response');
      return authUser;
    }

    console.log('Auth successful, user role:', authUser.role);
    const userId = params.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, canGiveFeedback: true, name: true }
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (user.role !== 'TRAINER') {
      return errorResponse('Only trainers can have feedback permission toggled', 400);
    }

    // Toggle the permission
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        canGiveFeedback: !user.canGiveFeedback
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canGiveFeedback: true
      }
    });

    return successResponse(
      updatedUser,
      `Feedback permission ${updatedUser.canGiveFeedback ? 'enabled' : 'disabled'} for ${updatedUser.name}`
    );
  } catch (error: any) {
    console.error('Error toggling feedback permission:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
