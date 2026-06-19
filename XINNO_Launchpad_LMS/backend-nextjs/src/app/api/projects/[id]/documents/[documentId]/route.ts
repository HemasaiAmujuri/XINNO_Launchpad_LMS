import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// DELETE /api/projects/[id]/documents/[documentId] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; documentId: string } }
) {
  try {
    const authUser = requireAuth(request);
    if (authUser instanceof NextResponse) return authUser;

    // Check if document exists
    const document = await prisma.projectDocument.findUnique({
      where: { id: params.documentId },
      include: {
        project: true,
      },
    });

    if (!document) {
      return errorResponse('Document not found', 404);
    }

    // Check if document belongs to the project
    if (document.projectId !== params.id) {
      return errorResponse('Document does not belong to this project', 400);
    }

    // Students can only delete their own uploaded documents
    if (authUser.role === 'STUDENT' && document.uploadedBy !== authUser.userId) {
      return errorResponse('You can only delete documents you uploaded', 403);
    }

    // Admin can delete any document
    // Mentor can delete documents from projects they mentor
    if (authUser.role === 'TRAINER' && document.project.mentorId !== authUser.userId) {
      return errorResponse('You can only delete documents from projects you mentor', 403);
    }

    await prisma.projectDocument.delete({
      where: { id: params.documentId },
    });

    return successResponse(null, 'Document deleted successfully');
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return errorResponse(error.message);
  }
}
