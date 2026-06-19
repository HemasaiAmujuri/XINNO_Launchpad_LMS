import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  // Find vijay's attempts
  const vijay = await prisma.user.findFirst({
    where: { email: 'vijay@gmail.com' }
  });
  
  if (!vijay) {
    console.log('User vijay not found');
    await prisma.$disconnect();
    return;
  }
  
  console.log('User:', vijay.name, vijay.email);
  
  // Find all attempts
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { studentId: vijay.id },
    include: {
      assessment: true,
      answers: true
    }
  });
  
  console.log('\nAttempts:');
  attempts.forEach(a => {
    console.log(`- ${a.assessment.title}: Status=${a.status}, Answers=${a.answers.length}, Score=${a.obtainedMarks}/${a.totalMarks}, StartedAt=${a.startedAt}, SubmittedAt=${a.submittedAt}`);
  });
  
  await prisma.$disconnect();
}

check();
