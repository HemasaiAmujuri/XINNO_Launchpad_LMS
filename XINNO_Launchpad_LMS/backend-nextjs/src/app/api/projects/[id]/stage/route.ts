import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';
import { sendAdminReviewEmail } from '@/lib/email';

// PUT /api/projects/[id]/stage - Update project stage
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const projectId = params.id;
    const body = await request.json();
    const { stage, status, mentorRemarks, studentNotes, dailyProgress } = body;

    // Check if project exists
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
      },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Authorization checks
    // Students can only update their own projects (only studentNotes)
    if (authUser.role === 'STUDENT') {
      if (project.studentId !== authUser.userId) {
        return errorResponse('You can only update your own project', 403);
      }
      // Students cannot add mentor remarks
      if (mentorRemarks) {
        return errorResponse('Students cannot add mentor remarks', 403);
      }
    }

    // Trainers can only update projects they mentor
    if (authUser.role === 'TRAINER' && project.mentorId !== authUser.userId) {
      return errorResponse('Only the assigned mentor can update this project', 403);
    }

    // Update stage progress
    const stageProgress = await prisma.projectStageProgress.update({
      where: {
        projectId_stage: {
          projectId,
          stage,
        },
      },
      data: {
        ...(status && { status }),
        ...(status === 'IN_PROGRESS' && !mentorRemarks && { startDate: new Date() }),
        ...(status === 'COMPLETED' && { completionDate: new Date() }),
        ...(mentorRemarks && { mentorRemarks }),
        ...(studentNotes && { studentNotes }),
        ...(dailyProgress && { dailyProgress }),
      },
    });

    // If stage is completed, update project's current stage to next stage
    if (status === 'COMPLETED') {
      const stages = [
        'PROBLEM_STATEMENT',
        'REQUIREMENT_ANALYSIS',
        'DESIGN_ARCHITECTURE',
        'DEVELOPMENT',
        'TESTING_VALIDATION',
        'DOCUMENTATION',
        'FINAL_DEMO_REVIEW',
      ];
      const currentIndex = stages.indexOf(stage);
      const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : stage;

      await prisma.project.update({
        where: { id: projectId },
        data: {
          currentStage: nextStage as any,
        },
      });

      // Mark next stage as IN_PROGRESS
      if (nextStage !== stage) {
        await prisma.projectStageProgress.update({
          where: {
            projectId_stage: {
              projectId,
              stage: nextStage as any,
            },
          },
          data: {
            status: 'IN_PROGRESS',
            startDate: new Date(),
          },
        });
      }
    }

    // 📧 Send email notification if mentor adds remarks or approves stage
    if (mentorRemarks && status) {
      try {
        const stageName = stage.split('_').map((word: string) => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
        
        await sendAdminReviewEmail(
          project.student.email,
          project.student.name,
          'Project Stage',
          `${project.title} - ${stageName}`,
          project.mentor?.name || 'Reviewer',
          status === 'COMPLETED',
          mentorRemarks
        );
        console.log('✅ Stage review email sent to:', project.student.email);
      } catch (emailError) {
        console.error('⚠️ Failed to send stage review email:', emailError);
      }
    }

    return successResponse(stageProgress, 'Stage updated successfully');
  } catch (error: any) {
    console.error('Error updating stage:', error);
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
