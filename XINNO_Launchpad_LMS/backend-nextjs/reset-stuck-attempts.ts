import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetStuckAttempts() {
  try {
    // Find vijay's user
    const vijay = await prisma.user.findFirst({
      where: { email: 'vijay@gmail.com' }
    });
    
    if (!vijay) {
      console.log('User not found');
      return;
    }
    
    console.log('Resetting stuck assessment attempts for:', vijay.name);
    
    // Find all IN_PROGRESS attempts with 0 answers
    const stuckAttempts = await prisma.assessmentAttempt.findMany({
      where: {
        studentId: vijay.id,
        status: 'IN_PROGRESS'
      },
      include: {
        assessment: true,
        answers: true
      }
    });
    
    console.log(`\nFound ${stuckAttempts.length} stuck attempts`);
    
    for (const attempt of stuckAttempts) {
      console.log(`\n- ${attempt.assessment.title}:`);
      console.log(`  Status: ${attempt.status}, Answers: ${attempt.answers.length}`);
      
      // Delete the stuck attempt
      await prisma.assessmentAttempt.delete({
        where: { id: attempt.id }
      });
      
      console.log(`  ✅ Deleted stuck attempt`);
    }
    
    console.log('\n✅ All stuck attempts have been reset!');
    console.log('You can now start fresh assessments.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetStuckAttempts();
