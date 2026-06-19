import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/projects/students - Get all students (Admin & Trainer)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const { searchParams } = new URL(request.url);
    const courseType = searchParams.get('courseType');

    const where: any = {
      role: 'STUDENT',
      isActive: true,
    };

    if (courseType) {
      where.courseType = courseType;
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        batchName: true,
        courseType: true,
        _count: {
          select: {
            projects: {
              where: {
                isCompleted: false,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse(students);
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return errorResponse(error.message);
  }
}
