import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// PUT /api/admin/projects/[id]/stage - Update stage progress (Admin review)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'TRAINER') {
      return errorResponse('Unauthorized access', 403);
    }

    const body = await request.json();
    const {
      stage,
      status,
      mentorRemarks,
      isApproved,
    } = body;

    if (!stage) {
      return errorResponse('Stage is required');
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        stageProgress: true,
      },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // If trainer is trying to update, verify they are the assigned mentor
    if (authUser.role === 'TRAINER' && project.mentorId !== authUser.userId) {
      return errorResponse('You are not the assigned mentor for this project', 403);
    }

    // Find the stage progress
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

    // Update stage progress
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (mentorRemarks !== undefined) updateData.mentorRemarks = mentorRemarks;
    
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
      if (isApproved) {
        updateData.approvedAt = new Date();
        updateData.approvedBy = authUser.userId;
        if (status === undefined) {
          updateData.status = 'COMPLETED';
        }
        if (!stageProgress.completionDate) {
          updateData.completionDate = new Date();
        }
      }
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

    // If stage is approved, move to next stage
    if (isApproved) {
      const stages = [
        'PROBLEM_STATEMENT',
        'REQUIREMENT_ANALYSIS',
        'DESIGN_ARCHITECTURE',
        'DEVELOPMENT',
        'TESTING_VALIDATION',
        'DOCUMENTATION',
        'FINAL_DEMO_REVIEW',
      ];

      const currentStageIndex = stages.indexOf(stage);
      const nextStage = stages[currentStageIndex + 1];

      if (nextStage) {
        // Update next stage to IN_PROGRESS
        await prisma.projectStageProgress.update({
          where: {
            projectId_stage: {
              projectId: params.id,
              stage: nextStage as any,
            },
          },
          data: {
            status: 'IN_PROGRESS',
            startDate: new Date(),
          },
        });

        // Update project's current stage
        await prisma.project.update({
          where: { id: params.id },
          data: {
            currentStage: nextStage as any,
          },
        });
      } else {
        // This was the final stage, mark project as completed
        await prisma.project.update({
          where: { id: params.id },
          data: {
            isCompleted: true,
            completionPercent: 100,
          },
        });
      }

      // Calculate completion percentage
      const completedStages = await prisma.projectStageProgress.count({
        where: {
          projectId: params.id,
          isApproved: true,
        },
      });

      const completionPercent = (completedStages / stages.length) * 100;

      await prisma.project.update({
        where: { id: params.id },
        data: {
          completionPercent,
        },
      });
    }

    return successResponse(updatedStageProgress, 'Stage updated successfully');
  } catch (error: any) {
    console.error('Error updating stage:', error);
    return errorResponse(error.message);
  }
}
