import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: {
      assessment: { title: 'Deva Test' }
    },
    include: {
      student: { select: { name: true, email: true } },
      assessment: { select: { title: true, passingMarks: true } },
      answers: {
        select: {
          marksAwarded: true,
          autoEvaluated: true,
          question: { select: { questionText: true, questionType: true, marks: true } }
        }
      }
    }
  });
  
  if (!attempt) {
    console.log('❌ No attempt found for Deva Test');
    return;
  }
  
  console.log(`\n📝 Deva Test - ${attempt.student.name} (${attempt.student.email})\n`);
  console.log(`Status: ${attempt.status}`);
  console.log(`Obtained: ${attempt.obtainedMarks} / ${attempt.totalMarks}`);
  console.log(`Passing: ${attempt.assessment.passingMarks}`);
  console.log(`Is Passed: ${attempt.isPassed ? '✅ YES' : '❌ NO'}`);
  console.log(`Reviewed At: ${attempt.reviewedAt || 'Not reviewed'}`);
  console.log(`Reviewed By: ${attempt.reviewedBy || 'Not reviewed'}\n`);
  
  console.log('📋 Answer Breakdown:\n');
  attempt.answers.forEach((ans: any, i: number) => {
    console.log(`Q${i+1}. [${ans.question.questionType}] ${ans.question.questionText.substring(0, 60)}...`);
    console.log(`    Marks: ${ans.marksAwarded} / ${ans.question.marks} (Auto: ${ans.autoEvaluated})\n`);
  });
  
  const total = attempt.answers.reduce((sum: number, ans: any) => sum + ans.marksAwarded, 0);
  console.log(`\n💯 Total from answers: ${total}`);
  console.log(`💯 Stored obtainedMarks: ${attempt.obtainedMarks}`);
  
  if (total !== attempt.obtainedMarks) {
    console.log('\n⚠️  MISMATCH DETECTED! Updating...');
    
    const updated = await prisma.assessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        obtainedMarks: total,
        isPassed: total >= attempt.assessment.passingMarks
      }
    });
    
    console.log(`✅ Updated: ${updated.obtainedMarks} / ${updated.totalMarks} - Passed: ${updated.isPassed}`);
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
