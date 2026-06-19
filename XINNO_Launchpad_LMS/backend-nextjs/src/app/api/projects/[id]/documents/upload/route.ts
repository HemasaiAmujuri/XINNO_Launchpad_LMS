import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';
import { parseMultipartForm, uploadFile, getFileType, validateFileSize } from '@/lib/upload';

// Next.js 14 route segment config
export const dynamic = 'force-dynamic';

// POST /api/projects/[id]/documents/upload - Upload file for project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    const projectId = params.id;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    // Students can only upload to their own projects
    if (authUser.role === 'STUDENT' && project.studentId !== authUser.userId) {
      return errorResponse('You can only upload files to your own projects', 403);
    }

    // Parse form data
    const { fields, files } = await parseMultipartForm(request);

    if (!files.file) {
      return errorResponse('No file provided', 400);
    }

    const file = files.file;
    const title = fields.title || file.name;
    const stage = fields.stage || null;

    // Validate file size (max 100MB)
    if (!validateFileSize(file, 100)) {
      return errorResponse('File size exceeds 100MB limit', 400);
    }

    // Upload file
    const fileUrl = await uploadFile(file, 'project-documents');
    const fileType = getFileType(file.name);

    // Create document record
    const document = await prisma.projectDocument.create({
      data: {
        projectId,
        title,
        fileUrl,
        fileType,
        uploadedBy: authUser.userId,
        stage: stage ? stage as any : null,
      },
    });

    return successResponse(document, 'File uploaded successfully', 201);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return errorResponse(error.message, 500);
  }
}

// GET /api/projects/[id]/documents/upload - Not allowed
export async function GET() {
  return errorResponse('Method not allowed', 405);
}
