import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOnboardingTest() {
  try {
    // Get the Onboarding Test
    const onboarding = await prisma.assessment.findFirst({
      where: { title: 'Onboarding Test - Full Stack' }
    });
    
    if (!onboarding) {
      console.log('Onboarding Test not found!');
      return;
    }
    
    console.log(`Found Onboarding Test: ${onboarding.id}`);
    
    // Create questions for Onboarding Test
    const questions = [
      {
        questionText: 'What does HTML stand for?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'EASY' as const,
        orderIndex: 0,
        options: JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language']),
        correctAnswer: 'Hyper Text Markup Language',
        courseType: 'FULL_STACK' as const
      },
      {
        questionText: 'Which programming language is known as the language of the web?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'EASY' as const,
        orderIndex: 1,
        options: JSON.stringify(['Python', 'JavaScript', 'Java', 'C++']),
        correctAnswer: 'JavaScript',
        courseType: 'FULL_STACK' as const
      },
      {
        questionText: 'What is the purpose of CSS?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'EASY' as const,
        orderIndex: 2,
        options: JSON.stringify(['To structure web pages', 'To style web pages', 'To add interactivity', 'To manage databases']),
        correctAnswer: 'To style web pages',
        courseType: 'FULL_STACK' as const
      },
      {
        questionText: 'Explain the difference between front-end and back-end development.',
        questionType: 'DESCRIPTIVE' as const,
        marks: 10,
        difficultyLevel: 'MEDIUM' as const,
        orderIndex: 3,
        characterLimit: 500,
        sampleAnswer: 'Front-end development focuses on the user interface and client-side interactions, while back-end development handles server-side logic, databases, and APIs.',
        courseType: 'FULL_STACK' as const
      },
      {
        questionText: 'What is a REST API?',
        questionType: 'DESCRIPTIVE' as const,
        marks: 10,
        difficultyLevel: 'MEDIUM' as const,
        orderIndex: 4,
        characterLimit: 500,
        sampleAnswer: 'REST (Representational State Transfer) API is an architectural style for building web services that use HTTP methods to perform CRUD operations.',
        courseType: 'FULL_STACK' as const
      }
    ];
    
    // Create each question
    for (const q of questions) {
      await prisma.question.create({
        data: {
          ...q,
          assessmentId: onboarding.id,
          isActive: true
        }
      });
    }
    
    console.log(`Created ${questions.length} questions for Onboarding Test`);
    
    // Update assessment total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    await prisma.assessment.update({
      where: { id: onboarding.id },
      data: { 
        totalMarks,
        passingMarks: Math.floor(totalMarks * 0.6) // 60% passing
      }
    });
    
    console.log(`Updated total marks to ${totalMarks}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOnboardingTest();
