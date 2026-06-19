import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { registerUserSchema } from '@/lib/validations';
import { successResponse, errorResponse, handleApiError, requireAuth } from '@/lib/auth';

// GET /api/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['ADMIN']);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const courseType = searchParams.get('courseType');

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(courseType && { courseType: courseType as any }),
      },
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
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['ADMIN']);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const validatedData = registerUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    const hashedPassword = await hashPassword(validatedData.password);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role || 'STUDENT',
        courseType: validatedData.courseType,
        courseLevel: validatedData.courseLevel,
        batchName: validatedData.batchName,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        courseType: true,
        batchName: true,
        createdAt: true,
      },
    });

    return successResponse(user, 'User created successfully', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message);
    }
    return handleApiError(error);
  }
}
