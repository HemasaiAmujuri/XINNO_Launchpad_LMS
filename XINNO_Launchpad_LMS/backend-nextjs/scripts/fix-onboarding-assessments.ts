import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOnboardingAssessments() {
  try {
    console.log('Starting assessment fix...');

    // Get Onboarding Test assessments
    const onboardingTests = await prisma.assessment.findMany({
      where: {
        title: 'Onboarding Test - Full Stack'
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    console.log(`Found ${onboardingTests.length} Onboarding Test assessments`);

    // Delete duplicate assessments (keep only one)
    if (onboardingTests.length > 1) {
      const toKeep = onboardingTests[0];
      const toDelete = onboardingTests.slice(1);
      
      for (const assessment of toDelete) {
        await prisma.assessment.delete({
          where: { id: assessment.id }
        });
        console.log(`Deleted duplicate assessment: ${assessment.id}`);
      }
    }

    // Get the remaining assessment
    const assessment = await prisma.assessment.findFirst({
      where: {
        title: 'Onboarding Test - Full Stack'
      },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    if (!assessment) {
      console.log('No Onboarding Test found');
      return;
    }

    console.log(`Assessment ${assessment.id} has ${assessment._count.questions} questions`);

    // If it has no questions, add some
    if (assessment._count.questions === 0) {
      console.log('Adding questions to assessment...');

      // Create new Full Stack questions
      const questions = [
        {
          questionText: 'What does HTML stand for?',
          questionType: 'MCQ' as const,
          marks: 10,
          difficultyLevel: 'EASY' as const,
          orderIndex: 0,
          options: JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language']),
          correctAnswer: 'Hyper Text Markup Language',
          isActive: true,
          assessmentId: assessment.id
        },
        {
          questionText: 'What is the purpose of CSS?',
          questionType: 'MCQ' as const,
          marks: 10,
          difficultyLevel: 'EASY' as const,
          orderIndex: 1,
          options: JSON.stringify(['To style web pages', 'To create databases', 'To write server code', 'To compile JavaScript']),
          correctAnswer: 'To style web pages',
          isActive: true,
          assessmentId: assessment.id
        },
        {
          questionText: 'Which JavaScript framework is used for building user interfaces?',
          questionType: 'MCQ' as const,
          marks: 10,
          difficultyLevel: 'MEDIUM' as const,
          orderIndex: 2,
          options: JSON.stringify(['React', 'Express', 'Django', 'Laravel']),
          correctAnswer: 'React',
          isActive: true,
          assessmentId: assessment.id
        },
        {
          questionText: 'What is Node.js?',
          questionType: 'MCQ' as const,
          marks: 10,
          difficultyLevel: 'MEDIUM' as const,
          orderIndex: 3,
          options: JSON.stringify(['JavaScript runtime for server-side', 'A database', 'A CSS framework', 'A testing library']),
          correctAnswer: 'JavaScript runtime for server-side',
          isActive: true,
          assessmentId: assessment.id
        },
        {
          questionText: 'Explain the difference between let, const, and var in JavaScript.',
          questionType: 'DESCRIPTIVE' as const,
          marks: 20,
          difficultyLevel: 'MEDIUM' as const,
          orderIndex: 4,
          characterLimit: 500,
          sampleAnswer: 'var is function-scoped, let and const are block-scoped. const cannot be reassigned, let can be reassigned.',
          isActive: true,
          assessmentId: assessment.id
        },
        {
          questionText: 'What is the difference between SQL and NoSQL databases? Give examples.',
          questionType: 'DESCRIPTIVE' as const,
          marks: 20,
          difficultyLevel: 'MEDIUM' as const,
          orderIndex: 5,
          characterLimit: 500,
          sampleAnswer: 'SQL databases are relational (MySQL, PostgreSQL). NoSQL databases are non-relational (MongoDB, Redis).',
          isActive: true,
          assessmentId: assessment.id
        },
        {
          questionText: 'Explain what RESTful API is and its key principles.',
          questionType: 'DESCRIPTIVE' as const,
          marks: 20,
          difficultyLevel: 'HARD' as const,
          orderIndex: 6,
          characterLimit: 1000,
          sampleAnswer: 'REST uses HTTP methods (GET, POST, PUT, DELETE), stateless architecture, uniform interface, client-server separation.',
          isActive: true,
          assessmentId: assessment.id
        }
      ];

      // Insert questions
      for (const question of questions) {
        await prisma.question.create({
          data: question
        });
      }

      console.log(`Added ${questions.length} questions to assessment`);
    }

    // Verify final state
    const finalAssessment = await prisma.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });

    console.log(`\nFinal state: Assessment ${finalAssessment?.id} has ${finalAssessment?._count.questions} questions`);
    console.log('✅ Assessment fixed successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOnboardingAssessments();
