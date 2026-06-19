import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, errorResponse } from '@/lib/auth';
import * as XLSX from 'xlsx';

// GET /api/admin/users/export - Export users to Excel
export async function GET(request: NextRequest) {
  try {
    const authUser = requireAuth(request, ['ADMIN']);
    if (authUser instanceof NextResponse) return authUser;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const batch = searchParams.get('batch');

    const where: any = {};
    
    if (role) {
      where.role = role;
    } else {
      // By default, show only STUDENT and TRAINER roles
      where.role = { in: ['STUDENT', 'TRAINER'] };
    }
    
    if (batch) {
      where.batchName = batch;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        courseType: true,
        courseLevel: true,
        batchName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assessmentAttempts: true,
            feedbackSubmissions: true,
            projects: true,
            mentorProjects: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    // Transform data for Excel
    const excelData = users.map(user => ({
      'ID': user.id,
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Course Type': user.courseType || 'N/A',
      'Course Level': user.courseLevel || 'N/A',
      'Batch': user.batchName || 'N/A',
      'Status': user.isActive ? 'Active' : 'Inactive',
      'Assessment Attempts': user._count.assessmentAttempts,
      'Feedback Submissions': user._count.feedbackSubmissions,
      'Projects': user._count.projects,
      'Mentor Projects': user._count.mentorProjects,
      'Created At': new Date(user.createdAt).toLocaleDateString(),
      'Updated At': new Date(user.updatedAt).toLocaleDateString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 38 }, // ID
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 12 }, // Role
      { wch: 15 }, // Course Type
      { wch: 15 }, // Course Level
      { wch: 15 }, // Batch
      { wch: 10 }, // Status
      { wch: 18 }, // Assessment Attempts
      { wch: 20 }, // Feedback Submissions
      { wch: 12 }, // Projects
      { wch: 15 }, // Mentor Projects
      { wch: 15 }, // Created At
      { wch: 15 }, // Updated At
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="users_export_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting users:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
