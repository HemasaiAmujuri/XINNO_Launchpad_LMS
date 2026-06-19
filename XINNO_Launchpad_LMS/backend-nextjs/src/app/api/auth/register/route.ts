import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, successResponse, errorResponse } from '@/lib/auth';
import { registerUserSchema } from '@/lib/validations';

// POST /api/auth/register - Public registration endpoint for students
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validatedData = registerUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create new user (always as STUDENT for public registration)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: 'STUDENT', // Force STUDENT role for public registration
        courseType: validatedData.courseType,
        courseLevel: validatedData.courseLevel || 'BEGINNER',
        batchName: validatedData.batchName,
        rollNumber: validatedData.rollNumber || null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        courseType: true,
        courseLevel: true,
        batchName: true,
        rollNumber: true,
        createdAt: true,
      },
    });

    return successResponse(
      { user },
      'Registration successful! Please login to continue.',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }

    return errorResponse(
      error.message || 'Registration failed. Please try again.',
      500
    );
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
