import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, errorResponse } from '@/lib/auth';
import ExcelJS from 'exceljs';

// GET /api/admin/assessments/[id]/submissions/export - Export submissions to Excel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = requireAuth(request, ['ADMIN', 'TRAINER', 'REVIEWER']);
    if (authUser instanceof NextResponse) return authUser;

    const assessmentId = params.id;

    // Get assessment details
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        title: true,
        totalMarks: true,
        passingMarks: true,
      },
    });

    if (!assessment) {
      return errorResponse('Assessment not found', 404);
    }

    // Get all submissions
    const submissions = await prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        status: 'SUBMITTED',
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            batchName: true,
            courseType: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Submissions');

    // Add title
    worksheet.mergeCells('A1:I1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = `${assessment.title} - Submissions Report`;
    titleRow.font = { size: 16, bold: true };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 30;

    // Add metadata
    worksheet.getCell('A2').value = `Total Marks: ${assessment.totalMarks}`;
    worksheet.getCell('A3').value = `Passing Marks: ${assessment.passingMarks}`;
    worksheet.getCell('A4').value = `Total Submissions: ${submissions.length}`;
    worksheet.getCell('A5').value = `Generated on: ${new Date().toLocaleString()}`;

    // Add headers
    const headerRow = worksheet.getRow(7);
    headerRow.values = [
      'Sr. No.',
      'Student Name',
      'Email',
      'Batch',
      'Course Type',
      'Submitted At',
      'Marks Obtained',
      'Total Marks',
      'Percentage',
      'Status',
      'Time Spent (mins)',
      'Reviewed By',
      'Reviewed At',
      'Remarks',
    ];

    // Style header row
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    submissions.forEach((submission, index) => {
      const percentage = ((submission.obtainedMarks / submission.totalMarks) * 100).toFixed(2);
      const status = submission.isPassed ? 'Passed' : 'Failed';
      const timeSpentMins = Math.round(submission.timeSpentSeconds / 60);
      
      const row = worksheet.addRow([
        index + 1,
        submission.student.name,
        submission.student.email,
        submission.student.batchName || 'N/A',
        submission.student.courseType || 'N/A',
        submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A',
        submission.obtainedMarks,
        submission.totalMarks,
        `${percentage}%`,
        status,
        timeSpentMins,
        submission.reviewedBy || 'Not Reviewed',
        submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleString() : 'N/A',
        submission.remarks || '',
      ]);

      // Color code status
      const statusCell = row.getCell(10);
      if (submission.isPassed) {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' },
        };
      } else {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCCCB' },
        };
      }

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }
    });

    // Set column widths
    worksheet.columns = [
      { width: 10 },  // Sr. No.
      { width: 20 },  // Student Name
      { width: 30 },  // Email
      { width: 15 },  // Batch
      { width: 15 },  // Course Type
      { width: 20 },  // Submitted At
      { width: 15 },  // Marks Obtained
      { width: 12 },  // Total Marks
      { width: 12 },  // Percentage
      { width: 12 },  // Status
      { width: 15 },  // Time Spent
      { width: 20 },  // Reviewed By
      { width: 20 },  // Reviewed At
      { width: 30 },  // Remarks
    ];

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber >= 7) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    // Create filename
    const filename = `${assessment.title.replace(/[^a-z0-9]/gi, '_')}_submissions_${Date.now()}.xlsx`;

    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting submissions:', error);
    return errorResponse(error.message, 500);
  }
}

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
  });
}
