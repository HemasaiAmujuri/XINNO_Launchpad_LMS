import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';

// GET /api/admin/questions - Get all questions with filters
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const questionType = searchParams.get('questionType');
    const difficulty = searchParams.get('difficulty');

    const where: any = {};
    if (assessmentId) where.assessmentId = assessmentId;
    if (questionType) where.questionType = questionType;
    if (difficulty) where.difficultyLevel = difficulty;

    const questions = await prisma.question.findMany({
      where,
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            courseType: true,
          },
        },
      },
      orderBy: [{ assessmentId: 'asc' }, { orderIndex: 'asc' }],
    });

    return successResponse(questions);
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return errorResponse(error.message, 500);
  }
}

// POST /api/admin/questions - Create new question
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();
    const {
      assessmentId,
      questionText,
      questionType,
      marks,
      difficultyLevel,
      orderIndex,
      options,
      correctAnswer,
      characterLimit,
      sampleAnswer,
      courseLevel,
      isActive,
    } = body;

    // Validate required fields
    if (!questionText || !questionType || !marks) {
      return errorResponse('Missing required fields: questionText, questionType, marks', 400);
    }

    // Validate MCQ questions
    if (questionType === 'MCQ') {
      if (!options || !correctAnswer) {
        return errorResponse('MCQ questions require options and correct answer', 400);
      }
    }

    // For standalone questions without assessment, create a generic assessment
    let finalAssessmentId = assessmentId;
    if (!finalAssessmentId) {
      // Validate and normalize courseLevel to CourseType enum
      const validCourseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'] as const;
      type CourseTypeValue = typeof validCourseTypes[number];
      let normalizedCourseType: CourseTypeValue = 'FULL_STACK'; // Default
      
      if (courseLevel) {
        const upperCourseLevel = courseLevel.toUpperCase() as CourseTypeValue;
        if (validCourseTypes.includes(upperCourseLevel)) {
          normalizedCourseType = upperCourseLevel;
        }
      }
      
      // Find or create a "Question Bank" assessment
      let questionBankAssessment = await prisma.assessment.findFirst({
        where: { title: 'Question Bank' }
      });

      if (!questionBankAssessment) {
        questionBankAssessment = await prisma.assessment.create({
          data: {
            title: 'Question Bank',
            description: 'General question bank for reusable questions',
            courseType: normalizedCourseType as any,
            totalMarks: 0,
            passingMarks: 0,
            timeLimitMinutes: 0,
            isPublished: false,
            createdBy: authUser.userId,
          }
        });
      }
      finalAssessmentId = questionBankAssessment.id;
    }

    const question = await prisma.question.create({
      data: {
        assessmentId: finalAssessmentId,
        questionText,
        questionType,
        marks: parseInt(marks),
        difficultyLevel: difficultyLevel || 'MEDIUM',
        orderIndex: orderIndex || 0,
        options: questionType === 'MCQ' ? (typeof options === 'string' ? options : JSON.stringify(options)) : undefined,
        correctAnswer: questionType === 'MCQ' ? correctAnswer : undefined,
        characterLimit: questionType === 'DESCRIPTIVE' ? characterLimit : undefined,
        sampleAnswer: questionType === 'DESCRIPTIVE' ? sampleAnswer : undefined,
        isActive: isActive !== false,
      },
    });

    return successResponse(question, 'Question created successfully', 201);
  } catch (error: any) {
    console.error('Error creating question:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
