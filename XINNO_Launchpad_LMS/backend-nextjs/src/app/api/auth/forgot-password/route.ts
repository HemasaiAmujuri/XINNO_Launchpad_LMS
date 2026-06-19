import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/auth';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Return error if user doesn't exist
    if (!user) {
      return errorResponse('Email not found. Please check and try again.', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      console.log(`✅ Password reset email sent to: ${user.email}`);
      console.log(`🔗 Reset URL: ${resetUrl}`);
    } catch (emailError) {
      console.error('❌ Error sending password reset email:', emailError);
      // Log the reset URL so admin can manually share it
      console.log(`⚠️ Manual reset URL for ${user.email}: ${resetUrl}`);
      // Still return success - don't fail the request if email fails
    }

    return successResponse(
      { 
        message: 'If the email exists, a reset link will be sent',
        // In development, include the reset URL in response
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      },
      'Password reset email sent'
    );
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return errorResponse(error.message || 'Failed to process request');
  }
}
