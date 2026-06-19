import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError, requireAuth } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validations';

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        courseType: true,
        batchName: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request, ['ADMIN']);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const validatedData = updateUserSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        courseType: true,
        batchName: true,
        isActive: true,
      },
    });

    return successResponse(user, 'User updated successfully');
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message);
    }
    return handleApiError(error);
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = requireAuth(request, ['ADMIN']);
    if (auth instanceof Response) return auth;

    await prisma.user.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
