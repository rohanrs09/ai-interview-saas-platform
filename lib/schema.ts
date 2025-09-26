import { pgTable, uuid, text, timestamp, json, integer, boolean, varchar, pgEnum, real } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { relations, sql as sqlRaw } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['candidate', 'recruiter']);
export const interviewStatusEnum = pgEnum('interview_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'inactive', 'cancelled', 'past_due']);
export const jobTypeEnum = pgEnum('job_type', ['full-time', 'part-time', 'contract', 'internship']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced']);
export const questionTypeEnum = pgEnum('question_type', ['technical', 'behavioral', 'situational']);

// Common fields
const timestamps = {
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`)
    .$onUpdate(() => new Date()),
};

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('candidate'),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  ...timestamps,
});

// Candidate profiles table
export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  resumeText: text('resume_text'),
  extractedSkills: json('extracted_skills').$type<string[]>(),
  experience: text('experience'),
  education: text('education'),
  location: text('location'),
  jobTitle: text('job_title'),
  phone: varchar('phone', { length: 20 }),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  summary: text('summary'),
  ...timestamps,
});

// User relations
export const usersRelations = relations(users, ({ one }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [users.id],
    references: [candidateProfiles.userId],
  }),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one }) => ({
  user: one(users, {
    fields: [candidateProfiles.userId],
    references: [users.id],
  }),
}));

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
  experienceLevel: difficultyEnum('experience_level').notNull().default('intermediate'),
  isRemote: boolean('is_remote').default(false),
  postedById: uuid('posted_by_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  isActive: boolean('is_active').default(true),
  estimatedTime: integer('estimated_time').default(30), // in minutes
  questionsCount: integer('questions_count').default(5),
  applicants: integer('applicants').default(0),
  ...timestamps,
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
  ...timestamps,
});

// Interview questions table
export const interviewQuestions = pgTable('interview_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }).notNull(),
  questionText: text('question_text').notNull(),
  questionType: questionTypeEnum('question_type').notNull().default('technical'),
  difficulty: difficultyEnum('difficulty').notNull().default('intermediate'),
  skillTag: varchar('skill_tag', { length: 100 }).notNull(),
  answerText: text('answer_text'),
  score: integer('score'),
  order: integer('order').notNull(),
  timeLimit: integer('time_limit'), // in seconds
  ...timestamps,
});

// Feedback reports table
export const feedbackReports = pgTable('feedback_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }).notNull(),
  overallScore: integer('overall_score').notNull(),
  summary: text('summary').notNull(),
  strengths: text('strengths').notNull(),
  areasForImprovement: text('areas_for_improvement').notNull(),
  skillAssessments: json('skill_assessments').$type<Array<{
    skill: string;
    score: number;
    feedback: string;
  }>>(),
  recommendations: text('recommendations').notNull(),
  ...timestamps,
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }).notNull().unique(),
  plan: varchar('plan', { length: 50 }).notNull(), // 'basic', 'premium', 'enterprise'
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  ...timestamps,
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

// Interview transcripts table for detailed transcript storage
export const interviewTranscripts = pgTable('interview_transcripts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => interviewQuestions.id, { onDelete: 'set null' }),
  speaker: varchar('speaker', { length: 50 }).notNull(), // 'assistant' or 'user'
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  duration: integer('duration'), // in milliseconds
  confidence: real('confidence'),
  emotion: varchar('emotion', { length: 50 }),
  ...timestamps,
});

// Job descriptions table
export const job_descriptions = pgTable('job_descriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  description: text('description').notNull(),
  requirements: text('requirements'),
  skills: json('skills').$type<string[]>(),
  difficulty: difficultyEnum('difficulty').default('intermediate'),
  isActive: boolean('is_active').default(true),
  ...timestamps,
});
