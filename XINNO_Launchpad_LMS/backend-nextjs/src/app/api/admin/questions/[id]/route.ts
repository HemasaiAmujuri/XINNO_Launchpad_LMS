import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// PUT /api/admin/questions/[id] - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const questionId = params.id;
    const body = await request.json();
    const {
      questionText,
      questionType,
      marks,
      difficultyLevel,
      orderIndex,
      options,
      correctAnswer,
      characterLimit,
      sampleAnswer,
      isActive,
    } = body;

    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      return errorResponse('Question not found', 404);
    }

    // Prepare update data
    const updateData: any = {};
    if (questionText !== undefined) updateData.questionText = questionText;
    if (questionType !== undefined) updateData.questionType = questionType;
    if (marks !== undefined) updateData.marks = parseInt(marks);
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle MCQ fields
    if (questionType === 'MCQ' || existingQuestion.questionType === 'MCQ') {
      if (options !== undefined) updateData.options = options;
      if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    }

    // Handle Descriptive fields
    if (questionType === 'DESCRIPTIVE' || existingQuestion.questionType === 'DESCRIPTIVE') {
      if (characterLimit !== undefined) updateData.characterLimit = characterLimit;
      if (sampleAnswer !== undefined) updateData.sampleAnswer = sampleAnswer;
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });

    return successResponse(question, 'Question updated successfully');
  } catch (error: any) {
    console.error('Error updating question:', error);
    return errorResponse(error.message, 500);
  }
}

// DELETE /api/admin/questions/[id] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const questionId = params.id;

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return errorResponse('Question not found', 404);
    }

    // Soft delete by setting isActive to false
    await prisma.question.update({
      where: { id: questionId },
      data: { isActive: false },
    });

    return successResponse(null, 'Question deleted successfully');
  } catch (error: any) {
    console.error('Error deleting question:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
