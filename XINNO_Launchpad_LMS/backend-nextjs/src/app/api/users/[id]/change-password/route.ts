import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hashPassword, comparePassword, successResponse, errorResponse } from '@/lib/auth';
import { sendPasswordChangedEmail } from '@/lib/email';

// POST /api/users/[id]/change-password - Change user password
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const userId = params.id;
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validation
    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters long', 400);
    }

    // Check authorization: Users can only change their own password, unless admin
    if (authUser.userId !== userId && authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized access', 403);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify current password (skip for admin changing other user's password)
    if (authUser.userId === userId) {
      const isPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isPasswordValid) {
        return errorResponse('Current password is incorrect', 401);
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // 📧 Send email notification
    try {
      await sendPasswordChangedEmail(user.email, user.name);
      console.log('✅ Password changed email sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send password changed email:', emailError);
      // Don't fail the request if email fails
    }

    return successResponse(null, 'Password changed successfully');
  } catch (error: any) {
    console.error('Error changing password:', error);
    return errorResponse(error.message, 500);
  }
}
