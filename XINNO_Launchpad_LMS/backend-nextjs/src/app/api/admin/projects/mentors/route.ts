import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/projects/mentors - Get all available mentors (Admin & Trainer)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const mentors = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'TRAINER' },
          { role: 'ADMIN' },
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            mentorProjects: {
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

    return successResponse(mentors);
  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    return errorResponse(error.message);
  }
}
