import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/projects/[id]/timeline - Get project timeline with all stages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const projectId = params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        stageProgress: {
          orderBy: {
            stage: 'asc',
          },
        },
        documents: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Check permissions
    const canView =
      authUser.role === 'ADMIN' ||
      authUser.role === 'REVIEWER' ||
      project.studentId === authUser.userId ||
      project.mentorId === authUser.userId;

    if (!canView) {
      return errorResponse('You do not have permission to view this project', 403);
    }

    // Calculate completion percentage
    const completedStages = project.stageProgress.filter((s: any) => s.status === 'COMPLETED').length;
    const totalStages = project.stageProgress.length;
    const completionPercent = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

    // Update completion percentage if needed
    if (project.completionPercent !== completionPercent) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          completionPercent,
          isCompleted: completionPercent === 100,
        },
      });
    }

    return successResponse({
      ...project,
      completionPercent,
    });
  } catch (error: any) {
    console.error('Error fetching project timeline:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
