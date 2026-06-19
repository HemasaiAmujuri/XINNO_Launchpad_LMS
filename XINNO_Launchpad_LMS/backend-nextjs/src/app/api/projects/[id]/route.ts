import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/projects/[id] - Get single project by ID
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
            batchName: true,
            courseType: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
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

    // Authorization check
    if (authUser.role === 'STUDENT' && project.studentId !== authUser.userId) {
      return errorResponse('Unauthorized access', 403);
    }

    if (authUser.role === 'TRAINER' && project.mentorId !== authUser.userId) {
      return errorResponse('Unauthorized access', 403);
    }

    return successResponse(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return errorResponse(error.message, 500);
  }
}

// PUT /api/projects/[id] - Update project (Student can update limited fields)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const projectId = params.id;
    const body = await request.json();

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return errorResponse('Project not found', 404);
    }

    // Authorization check
    if (authUser.role === 'STUDENT' && existingProject.studentId !== authUser.userId) {
      return errorResponse('Unauthorized access', 403);
    }

    // Students can only update notes, not core project details
    if (authUser.role === 'STUDENT') {
      return errorResponse('Students cannot update project details directly', 403);
    }

    // Admin/Trainer can update project details
    const updateData: any = {};
    
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.mentorId !== undefined) updateData.mentorId = body.mentorId;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.currentStage) updateData.currentStage = body.currentStage;
    if (body.completionPercent !== undefined) updateData.completionPercent = body.completionPercent;
    if (body.isCompleted !== undefined) updateData.isCompleted = body.isCompleted;
    if (body.finalGrade) updateData.finalGrade = body.finalGrade;

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
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
        stageProgress: true,
      },
    });

    return successResponse(updatedProject, 'Project updated successfully');
  } catch (error: any) {
    console.error('Error updating project:', error);
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/projects/[id] - Delete project (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN']);
    if (authUser instanceof NextResponse) return authUser;

    const projectId = params.id;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return errorResponse('Project not found', 404);
    }

    // Delete related records first (due to foreign key constraints)
    await prisma.projectDocument.deleteMany({
      where: { projectId },
    });

    await prisma.projectStageProgress.deleteMany({
      where: { projectId },
    });

    // Delete project
    await prisma.project.delete({
      where: { id: projectId },
    });

    return successResponse(null, 'Project deleted successfully');
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return errorResponse(error.message, 500);
  }
}
