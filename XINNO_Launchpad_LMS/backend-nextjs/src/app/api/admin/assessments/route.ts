import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, successResponse, errorResponse } from '@/lib/auth';
import { createAssessmentSchema } from '@/lib/validations';

// GET /api/admin/assessments - Get all assessments (Admin view with filters)
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER', 'REVIEWER']);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const courseType = searchParams.get('courseType');
    const isPublished = searchParams.get('isPublished');
    const batchName = searchParams.get('batchName');

    const where: any = {};

    if (courseType) where.courseType = courseType;
    if (isPublished !== null) where.isPublished = isPublished === 'true';
    if (batchName) where.batchName = batchName;

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(assessments);
  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return errorResponse(error.message, 500);
  }
}

// POST /api/admin/assessments - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER']);
    if (authUser instanceof NextResponse) return authUser;

    const body = await request.json();

    // Validate input
    const validatedData = createAssessmentSchema.parse(body);

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        ...validatedData,
        createdBy: authUser.userId,
      },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });

    return successResponse(assessment, 'Assessment created successfully', 201);
  } catch (error: any) {
    console.error('Error creating assessment:', error);
    
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    
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
