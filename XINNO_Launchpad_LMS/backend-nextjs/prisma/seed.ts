import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oraxinno.com' },
    update: {},
    create: {
      email: 'admin@oraxinno.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create Sample Trainer
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@oraxinno.com' },
    update: {},
    create: {
      email: 'trainer@oraxinno.com',
      password: await bcrypt.hash('Trainer@123', 10),
      name: 'John Trainer',
      role: 'TRAINER',
      courseType: 'FULL_STACK',
      isActive: true,
    },
  });

  console.log('✅ Trainer created:', trainer.email);

  // Create Sample Reviewer
  const reviewer = await prisma.user.upsert({
    where: { email: 'reviewer@oraxinno.com' },
    update: {},
    create: {
      email: 'reviewer@oraxinno.com',
      password: await bcrypt.hash('Reviewer@123', 10),
      name: 'Jane Reviewer',
      role: 'REVIEWER',
      courseType: 'FULL_STACK',
      isActive: true,
    },
  });

  console.log('✅ Reviewer created:', reviewer.email);

  // Create Sample Student
  const student = await prisma.user.upsert({
    where: { email: 'student@oraxinno.com' },
    update: {},
    create: {
      email: 'student@oraxinno.com',
      password: await bcrypt.hash('Student@123', 10),
      name: 'Alice Student',
      role: 'STUDENT',
      courseType: 'FULL_STACK',
      batchName: 'Batch-2024-01',
      isActive: true,
    },
  });

  console.log('✅ Student created:', student.email);

  // Create Sample Assessment
  const assessment = await prisma.assessment.create({
    data: {
      title: 'Onboarding Test - Full Stack',
      description: 'Initial assessment to test fundamental knowledge',
      courseType: 'FULL_STACK',
      totalMarks: 100,
      passingMarks: 60,
      timeLimitMinutes: 15,
      isPublished: true,
      createdBy: admin.id,
      questions: {
        create: [
          {
            questionText: 'What is the output of console.log(typeof null) in JavaScript?',
            questionType: 'MCQ',
            marks: 5,
            difficultyLevel: 'EASY',
            orderIndex: 1,
            options: JSON.stringify(['object', 'null', 'undefined', 'string']),
            correctAnswer: 'object',
            isActive: true,
          },
          {
            questionText: 'Explain the difference between let, const, and var in JavaScript.',
            questionType: 'DESCRIPTIVE',
            marks: 10,
            difficultyLevel: 'MEDIUM',
            orderIndex: 2,
            characterLimit: 500,
            sampleAnswer: 'var is function-scoped, let and const are block-scoped. const cannot be reassigned.',
            isActive: true,
          },
          {
            questionText: 'Which HTTP method is used to update a resource?',
            questionType: 'MCQ',
            marks: 5,
            difficultyLevel: 'EASY',
            orderIndex: 3,
            options: JSON.stringify(['GET', 'POST', 'PUT', 'DELETE']),
            correctAnswer: 'PUT',
            isActive: true,
          },
        ],
      },
    },
  });

  console.log('✅ Sample assessment created:', assessment.title);

  // Create Sample Project
  const project = await prisma.project.create({
    data: {
      title: 'E-Commerce Platform Development',
      description: 'Build a full-stack e-commerce application with Angular and Next.js',
      studentId: student.id,
      mentorId: trainer.id,
      courseType: 'FULL_STACK',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-31'),
      currentStage: 'PROBLEM_STATEMENT',
      completionPercent: 10,
      stageProgress: {
        create: [
          {
            stage: 'PROBLEM_STATEMENT',
            status: 'IN_PROGRESS',
            startDate: new Date(),
            mentorRemarks: 'Good start, refine the scope',
          },
          {
            stage: 'REQUIREMENT_ANALYSIS',
            status: 'PENDING',
          },
          {
            stage: 'DESIGN_ARCHITECTURE',
            status: 'PENDING',
          },
          {
            stage: 'DEVELOPMENT',
            status: 'PENDING',
          },
          {
            stage: 'TESTING_VALIDATION',
            status: 'PENDING',
          },
          {
            stage: 'DOCUMENTATION',
            status: 'PENDING',
          },
          {
            stage: 'FINAL_DEMO_REVIEW',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  console.log('✅ Sample project created:', project.title);

  // Create Feedback Form
  const feedbackForm = await prisma.feedbackForm.create({
    data: {
      title: 'Trainer Feedback Form',
      description: 'Feedback on training quality and content delivery',
      forRole: 'STUDENT',
      courseType: 'FULL_STACK',
      isActive: true,
      createdBy: admin.id,
      questions: {
        create: [
          {
            questionText: 'How would you rate the overall training quality?',
            questionType: 'RATING',
            isRequired: true,
            options: JSON.stringify(['1', '2', '3', '4', '5']),
            orderIndex: 1,
          },
          {
            questionText: 'What topics did you find most helpful?',
            questionType: 'TEXT',
            isRequired: true,
            orderIndex: 2,
          },
          {
            questionText: 'Which areas need improvement?',
            questionType: 'CHECKBOX',
            isRequired: false,
            options: JSON.stringify([
              'Content Clarity',
              'Pace of Teaching',
              'Hands-on Practice',
              'Doubt Resolution',
              'Project Guidance',
            ]),
            orderIndex: 3,
          },
        ],
      },
    },
  });

  console.log('✅ Feedback form created:', feedbackForm.title);

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📧 Login Credentials:');
  console.log('   Admin:    admin@oraxinno.com / Admin@123');
  console.log('   Trainer:  trainer@oraxinno.com / Trainer@123');
  console.log('   Reviewer: reviewer@oraxinno.com / Reviewer@123');
  console.log('   Student:  student@oraxinno.com / Student@123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
