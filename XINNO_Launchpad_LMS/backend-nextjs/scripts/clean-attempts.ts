import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndClean() {
  console.log('🔍 Checking Assessment Attempts...\n');
  
  // Get all attempts with details
  const attempts = await prisma.assessmentAttempt.findMany({
    include: {
      student: { select: { email: true, name: true } },
      assessment: { select: { title: true } },
      answers: true
    },
    orderBy: { startedAt: 'desc' }
  });
  
  console.log(`Total attempts in database: ${attempts.length}\n`);
  
  if (attempts.length === 0) {
    console.log('✅ No attempts found. Database is clean!\n');
    await prisma.$disconnect();
    return;
  }
  
  // Group by student
  const byStudent = attempts.reduce((acc: any, att) => {
    const email = att.student.email;
    if (!acc[email]) {
      acc[email] = {
        name: att.student.name,
        attempts: []
      };
    }
    acc[email].attempts.push({
      id: att.id,
      assessment: att.assessment.title,
      status: att.status,
      answers: att.answers.length,
      score: `${att.obtainedMarks}/${att.totalMarks}`,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt
    });
    return acc;
  }, {});
  
  // Display all attempts
  Object.entries(byStudent).forEach(([email, data]: [string, any]) => {
    console.log(`👤 ${data.name} (${email})`);
    data.attempts.forEach((att: any, index: number) => {
      const icon = att.status === 'SUBMITTED' ? '✅' : '🔄';
      console.log(`   ${icon} ${att.assessment}`);
      console.log(`      Status: ${att.status}`);
      console.log(`      Answers: ${att.answers}, Score: ${att.score}`);
      console.log(`      Started: ${att.startedAt?.toLocaleString() || 'N/A'}`);
      console.log(`      Submitted: ${att.submittedAt?.toLocaleString() || 'N/A'}`);
    });
    console.log();
  });
  
  // Find problematic attempts
  const problematic = attempts.filter(
    a => (a.status === 'IN_PROGRESS' && a.answers.length === 0) ||
         (a.status === 'SUBMITTED' && a.obtainedMarks === 0 && a.answers.length === 0)
  );
  
  if (problematic.length > 0) {
    console.log(`\n⚠️  Found ${problematic.length} problematic attempt(s):\n`);
    
    for (const att of problematic) {
      console.log(`   📝 ${att.student.name} - ${att.assessment.title}`);
      console.log(`      Status: ${att.status}, Answers: ${att.answers.length}`);
    }
    
    console.log('\n❓ Do you want to delete these problematic attempts? (yes/no)');
    console.log('   Run: npx tsx scripts/clean-attempts.ts --delete\n');
  } else {
    console.log('✅ No problematic attempts found!\n');
  }
  
  await prisma.$disconnect();
}

// Check for --delete flag
const shouldDelete = process.argv.includes('--delete');

if (shouldDelete) {
  (async () => {
    console.log('🗑️  Deleting problematic attempts...\n');
    
    const problematic = await prisma.assessmentAttempt.findMany({
      where: {
        OR: [
          { status: 'IN_PROGRESS', answers: { none: {} } },
          { status: 'SUBMITTED', obtainedMarks: 0, answers: { none: {} } }
        ]
      },
      include: {
        student: { select: { name: true } },
        assessment: { select: { title: true } }
      }
    });
    
    for (const att of problematic) {
      console.log(`   Deleting: ${att.student.name} - ${att.assessment.title}`);
      await prisma.assessmentAttempt.delete({ where: { id: att.id } });
    }
    
    console.log(`\n✅ Deleted ${problematic.length} attempt(s)!\n`);
    await prisma.$disconnect();
  })();
} else {
  checkAndClean();
}
