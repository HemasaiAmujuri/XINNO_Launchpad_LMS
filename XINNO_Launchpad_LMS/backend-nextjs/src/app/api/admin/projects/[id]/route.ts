import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/projects/[id] - Get project by ID (Admin & Trainer)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    if (authUser.role !== 'ADMIN' && authUser.role !== 'TRAINER' && authUser.role !== 'REVIEWER') {
      return errorResponse('Unauthorized access', 403);
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            batchName: true,
            courseType: true,
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
    
    // Trainers can only see projects where they are mentor
    if (authUser.role === 'TRAINER' && project.mentorId !== authUser.userId) {
      return errorResponse('Unauthorized access', 403);
    }

    return successResponse(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return errorResponse(error.message);
  }
}

// PUT /api/admin/projects/[id] - Update project (Admin & Trainer)
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
      title,
      description,
      mentorId,
      startDate,
      endDate,
      currentStage,
      completionPercent,
      isCompleted,
      finalGrade,
    } = body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return errorResponse('Project not found', 404);
    }
    
    // Trainers can only update projects where they are mentor
    if (authUser.role === 'TRAINER' && existingProject.mentorId !== authUser.userId) {
      return errorResponse('Unauthorized access', 403);
    }

    // If mentorId is being changed, verify the new mentor (ADMIN only)
    if (mentorId && mentorId !== existingProject.mentorId) {
      if (authUser.role !== 'ADMIN') {
        return errorResponse('Only admins can change project mentor', 403);
      }
      
      const mentor = await prisma.user.findUnique({
        where: { id: mentorId },
      });

      if (!mentor || (mentor.role !== 'TRAINER' && mentor.role !== 'ADMIN')) {
        return errorResponse('Invalid mentor');
      }
    }

    // Update project
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (mentorId !== undefined) updateData.mentorId = mentorId;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (currentStage !== undefined) updateData.currentStage = currentStage;
    if (completionPercent !== undefined) updateData.completionPercent = completionPercent;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (finalGrade !== undefined) updateData.finalGrade = finalGrade;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            batchName: true,
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
        documents: true,
      },
    });

    return successResponse(project, 'Project updated successfully');
  } catch (error: any) {
    console.error('Error updating project:', error);
    return errorResponse(error.message);
  }
}

// DELETE /api/admin/projects/[id] - Delete project (Admin only, Trainers cannot delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Only ADMIN can delete projects
    if (authUser.role !== 'ADMIN') {
      return errorResponse('Unauthorized access - only admins can delete projects', 403);
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    await prisma.project.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Project deleted successfully');
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return errorResponse(error.message);
  }
}
