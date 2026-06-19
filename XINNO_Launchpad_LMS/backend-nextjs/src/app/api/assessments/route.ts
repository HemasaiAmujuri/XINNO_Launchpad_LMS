import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError, requireAuth } from '@/lib/auth';
import { createAssessmentSchema } from '@/lib/validations';

// GET /api/assessments - Get all assessments
export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const courseType = searchParams.get('courseType');
    const isPublished = searchParams.get('isPublished');

    // Build filter conditions
    const whereConditions: any = {};
    
    // For students, only show published assessments and exclude Question Bank
    if (auth.role === 'STUDENT') {
      whereConditions.isPublished = true;
      whereConditions.NOT = {
        title: 'Question Bank'
      };
      
      // 🔥 CRITICAL: Filter by student's courseType from registration
      const student = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { courseType: true }
      });
      
      if (student?.courseType) {
        whereConditions.courseType = student.courseType;
      }
    }
    
    // For admins/trainers, apply optional filters
    if (courseType && auth.role !== 'STUDENT') {
      whereConditions.courseType = courseType as any;
    }
    if (isPublished && auth.role !== 'STUDENT') {
      whereConditions.isPublished = isPublished === 'true';
    }

    const assessments = await prisma.assessment.findMany({
      where: whereConditions,
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
        questions: auth.role === 'STUDENT' ? {
          where: { isActive: true },
          select: { id: true, questionType: true }
        } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // For students, add additional fields
    if (auth.role === 'STUDENT') {
      const enrichedAssessments = await Promise.all(
        assessments.map(async (assessment: any) => {
          // Get last attempt for this student
          const lastAttempt = await prisma.assessmentAttempt.findFirst({
            where: {
              assessmentId: assessment.id,
              studentId: auth.userId,
            },
            orderBy: { submittedAt: 'desc' },
            select: {
              id: true,
              status: true,
              submittedAt: true,
              totalMarks: true,
              obtainedMarks: true,
              isPassed: true,
              reviewedAt: true,
              reviewedBy: true,
            },
          });

          // Calculate question counts
          const mcqCount = assessment.questions?.filter((q: any) => q.questionType === 'MCQ').length || 0;
          const descriptiveCount = assessment.questions?.filter((q: any) => q.questionType === 'DESCRIPTIVE').length || 0;

          // Determine if student can attempt
          const canAttempt = !lastAttempt || (assessment.allowReAttempt && lastAttempt.status === 'SUBMITTED');

          return {
            ...assessment,
            totalQuestions: assessment._count.questions,
            mcqCount,
            descriptiveCount,
            canAttempt,
            lastAttempt: lastAttempt || undefined,
            hasAccessPin: !!assessment.accessPin, // Indicate if PIN is required (don't expose actual PIN)
            accessPin: undefined, // Remove actual PIN from response for security
            questions: undefined, // Remove questions array from response
          };
        })
      );

      return successResponse(enrichedAssessments);
    }

    return successResponse(assessments);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/assessments - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    
    console.log('📥 Received assessment data:', {
      title: body.title,
      hasAccessPin: !!body.accessPin,
      accessPin: body.accessPin ? '****' : 'none'
    });
    
    // Map frontend field names to backend schema
    const mappedData: any = {
      title: body.title,
      description: body.description,
      courseType: body.courseLevel || body.courseType, // Accept both field names
      totalMarks: body.totalMarks,
      passingMarks: body.passingMarks,
      timeLimitMinutes: body.timeLimit || body.timeLimitMinutes, // Accept both field names
      instructions: body.instructions,
      batchName: body.batchName,
      isPublished: true, // Auto-publish assessments
      allowReAttempt: body.allowReAttempt ?? false,
      showResults: body.showResults ?? true,
    };
    
    // Add accessPin if provided
    if (body.accessPin && body.accessPin.trim() !== '') {
      mappedData.accessPin = body.accessPin.trim();
      console.log('✅ PIN will be saved:', '****');
    } else {
      console.log('ℹ️ No PIN provided for this assessment');
    }

    // Validate and normalize courseType
    const validCourseTypes = ['CRT', 'ORACLE', 'EPM', 'OIC', 'FULL_STACK'];
    if (mappedData.courseType) {
      const upperCourseType = mappedData.courseType.toUpperCase();
      if (validCourseTypes.includes(upperCourseType)) {
        mappedData.courseType = upperCourseType;
      } else {
        return errorResponse(`Invalid courseType. Must be one of: ${validCourseTypes.join(', ')}`, 400);
      }
    }

    const validatedData = createAssessmentSchema.parse(mappedData);

    const assessment = await prisma.assessment.create({
      data: {
        ...validatedData,
        createdBy: auth.userId,
      },
    });

    // If questionIds are provided, update those questions to link with this assessment
    if (body.questionIds && Array.isArray(body.questionIds) && body.questionIds.length > 0) {
      await prisma.question.updateMany({
        where: {
          id: { in: body.questionIds }
        },
        data: {
          assessmentId: assessment.id
        }
      });
    }

    return successResponse(assessment, 'Assessment created and published successfully', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message);
    }
    return handleApiError(error);
  }
}
