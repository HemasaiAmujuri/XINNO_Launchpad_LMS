import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAssessments() {
  try {
    // Get all assessments with question counts
    const assessments = await prisma.assessment.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    console.log('\n=== All Assessments ===');
    for (const assessment of assessments) {
      console.log(`${assessment.title}: ${assessment._count.questions} questions`);
    }

    // Find assessments with 0 questions (excluding Question Bank)
    const emptyAssessments = assessments.filter(
      a => a._count.questions === 0 && a.title !== 'Question Bank'
    );

    if (emptyAssessments.length === 0) {
      console.log('\nAll assessments have questions!');
      await prisma.$disconnect();
      return;
    }

    console.log(`\n=== Found ${emptyAssessments.length} assessments with 0 questions ===`);

    // Get unlinked questions (those in Question Bank or with null assessmentId)
    const questionBank = await prisma.assessment.findFirst({
      where: { title: 'Question Bank' }
    });

    if (!questionBank) {
      console.log('Question Bank not found. Creating it...');
      await prisma.$disconnect();
      return;
    }

    const unlinkedQuestions = await prisma.question.findMany({
      where: {
        assessmentId: questionBank.id,
        isActive: true
      }
    });

    console.log(`\nFound ${unlinkedQuestions.length} questions in Question Bank`);

    // Link questions to empty assessments
    for (const assessment of emptyAssessments) {
      // Get 5 random questions
      const questionsToLink = unlinkedQuestions.slice(0, Math.min(5, unlinkedQuestions.length));
      
      if (questionsToLink.length > 0) {
        const questionIds = questionsToLink.map(q => q.id);
        
        await prisma.question.updateMany({
          where: { id: { in: questionIds } },
          data: { assessmentId: assessment.id }
        });

        console.log(`✓ Linked ${questionsToLink.length} questions to "${assessment.title}"`);
        
        // Remove these questions from the pool
        unlinkedQuestions.splice(0, questionsToLink.length);
      } else {
        console.log(`✗ No more questions available for "${assessment.title}"`);
      }
    }

    console.log('\n=== Done! ===');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAssessments();
