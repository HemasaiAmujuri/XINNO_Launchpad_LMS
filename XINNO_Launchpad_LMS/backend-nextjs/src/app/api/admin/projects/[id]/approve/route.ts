import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// PUT /api/admin/projects/[id]/approve - Approve project stage
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const projectId = params.id;
    const body = await request.json();
    const { stage } = body;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Check if mentor or admin
    if (authUser.role === 'TRAINER' && project.mentorId !== authUser.userId) {
      return errorResponse('Only the assigned mentor can approve stages', 403);
    }

    // Get stage progress
    const stageProgress = await prisma.projectStageProgress.findUnique({
      where: {
        projectId_stage: {
          projectId,
          stage,
        },
      },
    });

    if (!stageProgress) {
      return errorResponse('Stage not found', 404);
    }

    if (stageProgress.status !== 'COMPLETED') {
      return errorResponse('Stage must be completed before approval', 400);
    }

    // Approve stage
    const updatedStage = await prisma.projectStageProgress.update({
      where: {
        projectId_stage: {
          projectId,
          stage,
        },
      },
      data: {
        isApproved: true,
        approvedBy: authUser.userId,
        approvedAt: new Date(),
      },
    });

    return successResponse(updatedStage, 'Stage approved successfully');
  } catch (error: any) {
    console.error('Error approving stage:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
