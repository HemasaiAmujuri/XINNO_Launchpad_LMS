import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const assessmentTitle = process.argv[2];
  
  if (!assessmentTitle) {
    console.log('Usage: npx tsx mark-as-pending-review.ts "Assessment Title"');
    console.log('Example: npx tsx mark-as-pending-review.ts "Onboarding Test - Full Stack"');
    process.exit(1);
  }
  
  console.log(`\n🔄 Marking "${assessmentTitle}" attempts as pending review...\n`);
  
  const updated = await prisma.assessmentAttempt.updateMany({
    where: {
      assessment: {
        title: assessmentTitle
      },
      status: 'SUBMITTED'
    },
    data: {
      reviewedAt: null,
      reviewedBy: null
    }
  });
  
  console.log(`✅ Updated ${updated.count} attempt(s) - now showing "Under Review" to students\n`);
  
  // Show current status
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      assessment: {
        title: assessmentTitle
      },
      status: 'SUBMITTED'
    },
    include: {
      student: { select: { name: true } },
      assessment: { select: { title: true } }
    }
  });
  
  if (attempts.length > 0) {
    console.log('📋 Current Status:\n');
    attempts.forEach(a => {
      console.log(`${a.student.name} - ${a.assessment.title}`);
      console.log(`  Reviewed: ${a.reviewedAt ? '✅ Yes' : '⏳ Pending'}\n`);
    });
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
