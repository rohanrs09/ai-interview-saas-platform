import { pgTable, uuid, text, timestamp, json, integer, boolean, varchar, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['candidate', 'recruiter']);
export const interviewStatusEnum = pgEnum('interview_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'cancelled', 'past_due']);
export const jobTypeEnum = pgEnum('job_type', ['full-time', 'part-time', 'contract', 'internship']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const questionTypeEnum = pgEnum('question_type', ['technical', 'behavioral', 'situational']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('candidate'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Candidate profiles table
export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  resumeText: text('resume_text'),
  extractedSkills: json('extracted_skills').$type<string[]>(),
  experience: text('experience'),
  education: text('education'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Job descriptions table
export const jobDescriptions = pgTable('job_descriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  description: text('description').notNull(),
  requiredSkills: json('required_skills').$type<string[]>(),
  location: varchar('location', { length: 255 }),
  salaryRange: varchar('salary_range', { length: 100 }),
  jobType: jobTypeEnum('job_type').notNull().default('full-time'),
  experience: varchar('experience', { length: 100 }),
  difficulty: difficultyEnum('difficulty').notNull().default('intermediate'),
  estimatedTime: integer('estimated_time').default(30), // in minutes
  questionsCount: integer('questions_count').default(5),
  applicants: integer('applicants').default(0),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Interview sessions table
export const interviewSessions = pgTable('interview_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobDescriptions.id, { onDelete: 'cascade' }).notNull(),
  scheduledAt: timestamp('scheduled_at'),
  status: interviewStatusEnum('status').notNull().default('pending'),
  transcript: text('transcript'),
  totalScore: integer('total_score'),
  duration: integer('duration'), // in minutes
  skillGaps: json('skill_gaps').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Interview questions table
export const interviewQuestions = pgTable('interview_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }).notNull(),
  skillTag: varchar('skill_tag', { length: 100 }).notNull(),
  questionText: text('question_text').notNull(),
  answerText: text('answer_text'),
  score: integer('score'),
  order: integer('order').notNull(),
  type: questionTypeEnum('type').notNull().default('technical'),
  difficulty: difficultyEnum('difficulty').notNull().default('intermediate'),
  timeLimit: integer('time_limit'), // in minutes
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Feedback reports table
export const feedbackReports = pgTable('feedback_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }).notNull(),
  summary: text('summary').notNull(),
  strengths: text('strengths').notNull(),
  weaknesses: text('weaknesses').notNull(),
  ratedSkills: json('rated_skills').$type<Record<string, number>>(),
  overallScore: integer('overall_score').notNull(),
  recommendations: text('recommendations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).notNull(), // 'basic', 'premium', 'enterprise'
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Proctoring logs table (optional)
export const proctoringLogs = pgTable('proctoring_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'video_frame', 'audio_snippet', 'anomaly'
  data: json('data').$type<Record<string, any>>(),
  severity: varchar('severity', { length: 20 }).default('low'), // 'low', 'medium', 'high'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Skills table for better skill management
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }), // 'frontend', 'backend', 'database', etc.
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User skills junction table
export const userSkills = pgTable('user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  skillId: uuid('skill_id').references(() => skills.id, { onDelete: 'cascade' }).notNull(),
  proficiency: integer('proficiency').default(1), // 1-5 scale
  yearsOfExperience: integer('years_of_experience').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Interview templates table
export const interviewTemplates = pgTable('interview_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  jobType: jobTypeEnum('job_type').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  estimatedTime: integer('estimated_time').notNull(),
  questionsCount: integer('questions_count').notNull(),
  skills: json('skills').$type<string[]>(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Template questions table
export const templateQuestions = pgTable('template_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').references(() => interviewTemplates.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(),
  type: questionTypeEnum('type').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  skillTag: varchar('skill_tag', { length: 100 }),
  timeLimit: integer('time_limit'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
