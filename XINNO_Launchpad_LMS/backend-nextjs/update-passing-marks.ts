import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Updating Passing Marks to 40%...\n');
  
  // Update vijay Test 1 and Deva Test
  const updated = await prisma.assessment.updateMany({
    where: {
      title: {
        in: ['vijay Test 1', 'Deva Test']
      }
    },
    data: {
      passingMarks: 18 // 40% of 45
    }
  });
  
  console.log(`✅ Updated ${updated.count} assessments to 18/45 (40%)\n`);
  
  // Show all assessments
  const assessments = await prisma.assessment.findMany({
    where: {
      title: {
        not: 'Question Bank'
      }
    },
    select: {
      title: true,
      totalMarks: true,
      passingMarks: true
    }
  });
  
  console.log('📊 Current Passing Marks:\n');
  assessments.forEach(a => {
    const percentage = ((a.passingMarks / a.totalMarks) * 100).toFixed(0);
    console.log(`${a.title}: ${a.passingMarks}/${a.totalMarks} (${percentage}%)`);
  });
  
  // Re-evaluate all attempts
  console.log('\n🔄 Re-evaluating all attempts...\n');
  
  const attempts = await prisma.assessmentAttempt.findMany({
    where: {
      status: 'SUBMITTED'
    },
    include: {
      assessment: true,
      student: { select: { name: true } },
      answers: true
    }
  });
  
  for (const attempt of attempts) {
    const totalMarks = attempt.answers.reduce((sum: any, ans: any) => sum + (ans.marksAwarded || 0), 0);
    const isPassed = totalMarks >= attempt.assessment.passingMarks;
    
    await prisma.assessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        obtainedMarks: totalMarks,
        isPassed
      }
    });
    
    console.log(`${attempt.student.name} - ${attempt.assessment.title}: ${totalMarks}/${attempt.totalMarks} - ${isPassed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  console.log('\n✅ All done!');
  
  await prisma.$disconnect();
}

main().catch(console.error);
