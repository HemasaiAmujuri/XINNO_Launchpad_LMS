import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// POST /api/projects/[id]/documents - Upload a project document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const { title, fileUrl, fileType, stage } = body;

    if (!title || !fileUrl || !fileType) {
      return errorResponse('Title, file URL, and file type are required');
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Students can only upload to their own projects
    if (authUser.role === 'STUDENT' && project.studentId !== authUser.userId) {
      return errorResponse('You can only upload documents to your own projects', 403);
    }

    // Create document
    const document = await prisma.projectDocument.create({
      data: {
        projectId: params.id,
        title,
        fileUrl,
        fileType,
        uploadedBy: authUser.userId,
        stage: stage || null,
      },
    });

    return successResponse(document, 'Document uploaded successfully', 201);
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return errorResponse(error.message);
  }
}

// GET /api/projects/[id]/documents - Get all documents for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Check access
    if (
      authUser.role === 'STUDENT' &&
      project.studentId !== authUser.userId
    ) {
      return errorResponse('You can only view your own project documents', 403);
    }

    if (
      authUser.role === 'TRAINER' &&
      project.mentorId !== authUser.userId
    ) {
      return errorResponse('You can only view documents for projects you mentor', 403);
    }

    const documents = await prisma.projectDocument.findMany({
      where: { projectId: params.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(documents);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return errorResponse(error.message);
  }
}
