import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script helps reset stuck or failed assessment attempts for students
 * Use cases:
 * 1. Student accidentally started assessment but didn't complete
 * 2. Assessment got stuck and student can't retake
 * 3. Reset specific student's attempts for fresh start
 */

async function main() {
  console.log('🔍 Assessment Attempt Reset Utility\n');
  
  // Get command line arguments
  const args = process.argv.slice(2);
  const studentEmail = args[0];
  const assessmentTitle = args[1];
  
  try {
    if (studentEmail && assessmentTitle) {
      // Reset specific student's specific assessment
      await resetSpecificAttempt(studentEmail, assessmentTitle);
    } else if (studentEmail) {
      // Reset all attempts for a student
      await resetStudentAttempts(studentEmail);
    } else {
      // Show all students with stuck attempts
      await showStuckAttempts();
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Show all students who have stuck attempts (IN_PROGRESS with 0 answers or SUBMITTED with 0 score)
 */
async function showStuckAttempts() {
  console.log('📊 Finding students with stuck/failed attempts...\n');
  
  const attempts = await prisma.assessmentAttempt.findMany({
    include: {
      student: {
        select: { email: true, name: true }
      },
      assessment: {
        select: { title: true }
      },
      answers: true
    }
  });
  
  const stuckAttempts = attempts.filter(
    a => (a.status === 'IN_PROGRESS' && a.answers.length === 0) || 
         (a.status === 'SUBMITTED' && a.obtainedMarks === 0)
  );
  
  if (stuckAttempts.length === 0) {
    console.log('✅ No stuck attempts found! All students are good to go.\n');
    return;
  }
  
  console.log(`Found ${stuckAttempts.length} stuck/failed attempt(s):\n`);
  
  const grouped = stuckAttempts.reduce((acc, attempt) => {
    const email = attempt.student.email;
    if (!acc[email]) {
      acc[email] = {
        name: attempt.student.name,
        attempts: []
      };
    }
    acc[email].attempts.push({
      assessment: attempt.assessment.title,
      status: attempt.status,
      answers: attempt.answers.length,
      score: `${attempt.obtainedMarks}/${attempt.totalMarks}`
    });
    return acc;
  }, {} as any);
  
  Object.entries(grouped).forEach(([email, data]: [string, any]) => {
    console.log(`👤 ${data.name} (${email})`);
    data.attempts.forEach((att: any) => {
      console.log(`   📝 ${att.assessment}`);
      console.log(`      Status: ${att.status}, Answers: ${att.answers}, Score: ${att.score}`);
    });
    console.log();
  });
  
  console.log('💡 Usage:');
  console.log('   Reset all attempts for a student:');
  console.log('   npx tsx scripts/reset-student-attempts.ts <email>\n');
  console.log('   Reset specific assessment for a student:');
  console.log('   npx tsx scripts/reset-student-attempts.ts <email> "<assessment-title>"\n');
  console.log('Example:');
  console.log('   npx tsx scripts/reset-student-attempts.ts vijay@gmail.com');
  console.log('   npx tsx scripts/reset-student-attempts.ts vijay@gmail.com "vijay Test 1"\n');
}

/**
 * Reset all stuck attempts for a specific student
 */
async function resetStudentAttempts(email: string) {
  console.log(`🔍 Looking for student: ${email}\n`);
  
  const student = await prisma.user.findUnique({
    where: { email },
    include: {
      assessmentAttempts: {
        include: {
          assessment: true,
          answers: true
        }
      }
    }
  });
  
  if (!student) {
    console.log('❌ Student not found with this email.\n');
    return;
  }
  
  console.log(`👤 Found: ${student.name}\n`);
  
  const stuckAttempts = student.assessmentAttempts.filter(
    a => (a.status === 'IN_PROGRESS' && a.answers.length === 0) ||
         (a.status === 'SUBMITTED' && a.obtainedMarks === 0)
  );
  
  if (stuckAttempts.length === 0) {
    console.log('✅ No stuck attempts found for this student.\n');
    return;
  }
  
  console.log(`Found ${stuckAttempts.length} stuck attempt(s):\n`);
  
  for (const attempt of stuckAttempts) {
    console.log(`   📝 ${attempt.assessment.title}`);
    console.log(`      Status: ${attempt.status}, Answers: ${attempt.answers.length}`);
    
    await prisma.assessmentAttempt.delete({
      where: { id: attempt.id }
    });
    
    console.log(`      ✅ Deleted\n`);
  }
  
  console.log(`✅ Reset complete! ${student.name} can now take fresh assessments.\n`);
}

/**
 * Reset specific assessment attempt for a student
 */
async function resetSpecificAttempt(email: string, assessmentTitle: string) {
  console.log(`🔍 Looking for: ${email} - "${assessmentTitle}"\n`);
  
  const student = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!student) {
    console.log('❌ Student not found.\n');
    return;
  }
  
  const assessment = await prisma.assessment.findFirst({
    where: { title: assessmentTitle }
  });
  
  if (!assessment) {
    console.log('❌ Assessment not found.\n');
    return;
  }
  
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: {
      assessmentId_studentId: {
        assessmentId: assessment.id,
        studentId: student.id
      }
    },
    include: {
      answers: true
    }
  });
  
  if (!attempt) {
    console.log('✅ No attempt found. Student can start fresh.\n');
    return;
  }
  
  console.log(`Found attempt:`);
  console.log(`   Status: ${attempt.status}`);
  console.log(`   Answers: ${attempt.answers.length}`);
  console.log(`   Score: ${attempt.obtainedMarks}/${attempt.totalMarks}\n`);
  
  await prisma.assessmentAttempt.delete({
    where: { id: attempt.id }
  });
  
  console.log(`✅ Deleted! ${student.name} can now retake "${assessmentTitle}".\n`);
}

// Run the script
main();
