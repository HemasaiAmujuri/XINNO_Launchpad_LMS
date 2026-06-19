import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// PUT /api/projects/stage - Update stage progress (Student)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const { stage, studentNotes, dailyProgress } = body;

    if (!stage) {
      return errorResponse('Stage is required');
    }

    // Check if project exists and belongs to student
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Students can only update their own projects
    if (authUser.role === 'STUDENT' && project.studentId !== authUser.userId) {
      return errorResponse('You can only update your own projects', 403);
    }

    // Get the stage progress
    const stageProgress = await prisma.projectStageProgress.findUnique({
      where: {
        projectId_stage: {
          projectId: params.id,
          stage: stage,
        },
      },
    });

    if (!stageProgress) {
      return errorResponse('Stage not found', 404);
    }

    // Student can only update if stage is IN_PROGRESS
    if (stageProgress.status !== 'IN_PROGRESS') {
      return errorResponse('This stage is not in progress');
    }

    // Update stage progress
    const updateData: any = {};
    if (studentNotes !== undefined) updateData.studentNotes = studentNotes;
    if (dailyProgress !== undefined) {
      // Merge with existing daily progress
      const existing = stageProgress.dailyProgress as any;
      updateData.dailyProgress = {
        ...existing,
        ...dailyProgress,
      };
    }

    const updatedStageProgress = await prisma.projectStageProgress.update({
      where: {
        projectId_stage: {
          projectId: params.id,
          stage: stage,
        },
      },
      data: updateData,
    });

    return successResponse(updatedStageProgress, 'Stage progress updated successfully');
  } catch (error: any) {
    console.error('Error updating stage progress:', error);
    return errorResponse(error.message);
  }
}

// POST /api/projects/stage/complete - Mark stage as completed (Student)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const { stage } = body;

    if (!stage) {
      return errorResponse('Stage is required');
    }

    // Check if project exists and belongs to student
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    if (authUser.role === 'STUDENT' && project.studentId !== authUser.userId) {
      return errorResponse('You can only update your own projects', 403);
    }

    // Get the stage progress
    const stageProgress = await prisma.projectStageProgress.findUnique({
      where: {
        projectId_stage: {
          projectId: params.id,
          stage: stage,
        },
      },
    });

    if (!stageProgress) {
      return errorResponse('Stage not found', 404);
    }

    if (stageProgress.status === 'COMPLETED') {
      return errorResponse('Stage is already marked as completed');
    }

    // Update stage to COMPLETED and set completion date
    const updatedStageProgress = await prisma.projectStageProgress.update({
      where: {
        projectId_stage: {
          projectId: params.id,
          stage: stage,
        },
      },
      data: {
        status: 'COMPLETED',
        completionDate: new Date(),
      },
    });

    return successResponse(updatedStageProgress, 'Stage marked as completed. Waiting for mentor approval.');
  } catch (error: any) {
    console.error('Error completing stage:', error);
    return errorResponse(error.message);
  }
}
