import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError } from '@/lib/auth';

// OPTIONS /api/auth/login - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
  });
}

// POST /api/auth/login
export async function POST(request: NextRequest) {
     console.log("========== API HIT ==========");
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    console.log(email,  "email");
    console.log(password, "password");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("user", user)

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    if (!user.isActive) {
      return errorResponse('Your account has been deactivated', 403);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    console.log(isPasswordValid , "isPasswordValid")

    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

      console.log(token, "token");


    return successResponse(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          courseType: user.courseType,
          batchName: user.batchName,
          canGiveFeedback: user.canGiveFeedback,
        },
      },
      'Login successful'
    );
  } catch (error: any) {
    console.log(error, "err")
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message);
    }
    return handleApiError(error);
  }
}
