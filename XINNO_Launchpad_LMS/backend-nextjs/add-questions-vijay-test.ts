import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addQuestions() {
  try {
    // Find "vijay Test 1" assessment
    const assessment = await prisma.assessment.findFirst({
      where: { title: { contains: 'vijay' } },
      include: { questions: true }
    });
    
    if (!assessment) {
      console.log('Assessment not found');
      return;
    }
    
    console.log('Assessment:', assessment.title);
    console.log('Current questions:', assessment.questions.length);
    
    if (assessment.questions.length > 0) {
      console.log('Assessment already has questions. Skipping...');
      return;
    }
    
    console.log('\nAdding questions to assessment...');
    
    // Add ORACLE course questions
    const questions = [
      {
        questionText: 'What does SQL stand for?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'EASY' as const,
        orderIndex: 0,
        options: JSON.stringify(['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'System Query Language']),
        correctAnswer: 'Structured Query Language',
        isActive: true,
        assessmentId: assessment.id
      },
      {
        questionText: 'Which Oracle database object is used to store data?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'EASY' as const,
        orderIndex: 1,
        options: JSON.stringify(['Table', 'View', 'Index', 'Sequence']),
        correctAnswer: 'Table',
        isActive: true,
        assessmentId: assessment.id
      },
      {
        questionText: 'What is a PRIMARY KEY in Oracle?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'MEDIUM' as const,
        orderIndex: 2,
        options: JSON.stringify(['Unique identifier for a row', 'Foreign reference', 'Index type', 'Constraint type']),
        correctAnswer: 'Unique identifier for a row',
        isActive: true,
        assessmentId: assessment.id
      },
      {
        questionText: 'Which SQL command is used to retrieve data from a database?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'EASY' as const,
        orderIndex: 3,
        options: JSON.stringify(['SELECT', 'INSERT', 'UPDATE', 'DELETE']),
        correctAnswer: 'SELECT',
        isActive: true,
        assessmentId: assessment.id
      },
      {
        questionText: 'What is the difference between TRUNCATE and DELETE in Oracle?',
        questionType: 'MCQ' as const,
        marks: 5,
        difficultyLevel: 'MEDIUM' as const,
        orderIndex: 4,
        options: JSON.stringify(['TRUNCATE is faster and cannot be rolled back', 'DELETE is faster', 'Both are same', 'TRUNCATE deletes structure also']),
        correctAnswer: 'TRUNCATE is faster and cannot be rolled back',
        isActive: true,
        assessmentId: assessment.id
      },
      {
        questionText: 'Explain the difference between INNER JOIN and OUTER JOIN in Oracle SQL.',
        questionType: 'DESCRIPTIVE' as const,
        marks: 10,
        difficultyLevel: 'MEDIUM' as const,
        orderIndex: 5,
        characterLimit: 500,
        sampleAnswer: 'INNER JOIN returns only matching rows from both tables. OUTER JOIN (LEFT, RIGHT, FULL) returns all rows from one or both tables even if there is no match.',
        isActive: true,
        assessmentId: assessment.id
      },
      {
        questionText: 'What are indexes in Oracle? Explain their advantages and disadvantages.',
        questionType: 'DESCRIPTIVE' as const,
        marks: 10,
        difficultyLevel: 'HARD' as const,
        orderIndex: 6,
        characterLimit: 500,
        sampleAnswer: 'Indexes are database objects that improve query performance by providing quick access to rows. Advantages: Faster SELECT queries. Disadvantages: Slower INSERT/UPDATE/DELETE operations, requires storage space.',
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
    
    console.log(`✅ Added ${questions.length} questions to "${assessment.title}"`);
    
    // Calculate total marks
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    console.log(`Total marks: ${totalMarks}`);
    
    // Update assessment total marks
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { totalMarks }
    });
    
    console.log('✅ Updated assessment total marks');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addQuestions();
