import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return errorResponse('Token and new password are required', 400);
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400);
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log(`✅ Password reset successful for user: ${user.email}`);

    return successResponse(
      { message: 'Password has been reset successfully' },
      'Password reset successful'
    );
  } catch (error: any) {
    console.error('Error in reset-password:', error);
    return errorResponse(error.message || 'Failed to reset password');
  }
}
