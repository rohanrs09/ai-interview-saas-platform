import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db';
import { jobDescriptions, interviewSessions, candidateProfiles, users, feedbackReports } from './schema';
import { eq, and, desc } from 'drizzle-orm';
import { aiAnalysisService } from './ai-analysis';

const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null;

export interface JobDescriptionData {
  title: string;
  company: string;
  description: string;
  location?: string;
  salaryRange?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  isRemote?: boolean;
  estimatedTime?: number;
  questionsCount?: number;
}

export interface ExtractedJobData {
  requiredSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  niceToHave: string[];
  companyInfo: string;
  benefits: string[];
}

export interface CandidateReport {
  candidateId: string;
  candidateName: string;
  email: string;
  jobTitle: string;
  sessionId: string;
  overallScore: number;
  skillScores: Array<{
    skill: string;
    score: number;
    feedback: string;
  }>;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  interviewDate: Date;
  duration: number;
  status: 'completed' | 'in_progress' | 'pending';
}

export class RecruiterService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-pro' });

  async createJobPosting(
    recruiterId: string, 
    jobData: JobDescriptionData
  ): Promise<string> {
    try {
      // Extract skills and other data from job description
      const extractedData = await this.extractJobRequirements(jobData.description);
      
      // Create job posting in database
      const result = await db.insert(jobDescriptions).values({
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        requiredSkills: extractedData.requiredSkills,
        location: jobData.location,
        salaryRange: jobData.salaryRange,
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        isRemote: jobData.isRemote || false,
        estimatedTime: jobData.estimatedTime || 30,
        questionsCount: jobData.questionsCount || 5,
        postedById: recruiterId,
        isActive: true
      }).returning();

      return result[0].id;
    } catch (error) {
      console.error('Error creating job posting:', error);
      throw new Error('Failed to create job posting');
    }
  }

  async extractJobRequirements(jobDescription: string): Promise<ExtractedJobData> {
    if (!this.model) {
      return this.generateMockJobData(jobDescription);
    }

    const prompt = `
      Analyze this job description and extract key information:
      
      ${jobDescription}
      
      Extract and return JSON with:
      {
        "requiredSkills": ["skill1", "skill2"], // Technical and soft skills
        "responsibilities": ["resp1", "resp2"], // Key job responsibilities  
        "qualifications": ["qual1", "qual2"], // Required qualifications
        "niceToHave": ["nice1", "nice2"], // Preferred qualifications
        "companyInfo": "brief company description",
        "benefits": ["benefit1", "benefit2"] // Mentioned benefits
      }
      
      Focus on specific, actionable skills and clear responsibilities.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        return this.validateExtractedData(extracted);
      }
    } catch (error) {
      console.error('Error extracting job requirements:', error);
    }

    return this.generateMockJobData(jobDescription);
  }

  private validateExtractedData(data: any): ExtractedJobData {
    return {
      requiredSkills: Array.isArray(data.requiredSkills) ? data.requiredSkills.slice(0, 10) : [],
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.slice(0, 8) : [],
      qualifications: Array.isArray(data.qualifications) ? data.qualifications.slice(0, 8) : [],
      niceToHave: Array.isArray(data.niceToHave) ? data.niceToHave.slice(0, 5) : [],
      companyInfo: data.companyInfo || 'Technology company',
      benefits: Array.isArray(data.benefits) ? data.benefits.slice(0, 5) : []
    };
  }

  async generateInterviewQuestions(
    jobId: string,
    customRequirements?: string[]
  ): Promise<any[]> {
    try {
      // Get job details
      const job = await db.select().from(jobDescriptions).where(eq(jobDescriptions.id, jobId)).limit(1);
      if (job.length === 0) {
        throw new Error('Job not found');
      }

      const jobData = job[0];
      const skills = customRequirements || jobData.requiredSkills || [];

      // Generate questions using AI analysis service
      const questions = await aiAnalysisService.generateSkillBasedQuestions(
        skills,
        jobData.description,
        jobData.experienceLevel,
        jobData.questionsCount || 5
      );

      return questions;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  async getCandidateReports(
    recruiterId: string,
    jobId?: string,
    limit: number = 50
  ): Promise<CandidateReport[]> {
    try {
      const whereCondition = jobId 
        ? and(
            eq(jobDescriptions.postedById, recruiterId),
            eq(interviewSessions.jobId, jobId)
          )
        : eq(jobDescriptions.postedById, recruiterId);

      const query = db
        .select({
          sessionId: interviewSessions.id,
          candidateId: interviewSessions.candidateId,
          jobId: interviewSessions.jobId,
          duration: interviewSessions.duration,
          status: interviewSessions.status,
          candidateName: users.name,
          candidateEmail: users.email,
          jobTitle: jobDescriptions.title,
          // Feedback data
          reportSummary: feedbackReports.summary,
          reportStrengths: feedbackReports.strengths,
          reportImprovements: feedbackReports.areasForImprovement,
          reportRecommendations: feedbackReports.recommendations,
          skillAssessments: feedbackReports.skillAssessments,
          overallScore: feedbackReports.overallScore
        })
        .from(interviewSessions)
        .innerJoin(users, eq(interviewSessions.candidateId, users.id))
        .innerJoin(jobDescriptions, eq(interviewSessions.jobId, jobDescriptions.id))
        .leftJoin(feedbackReports, eq(feedbackReports.sessionId, interviewSessions.id))
        .where(whereCondition)
        .orderBy(desc(interviewSessions.createdAt))
        .limit(limit);

      const results = await query;

      return results.map(row => ({
        candidateId: row.candidateId,
        candidateName: row.candidateName,
        email: row.candidateEmail,
        jobTitle: row.jobTitle,
        sessionId: row.sessionId,
        overallScore: row.overallScore || 0,
        skillScores: Array.isArray(row.skillAssessments) 
          ? row.skillAssessments.map((assessment: any) => ({
              skill: assessment.skill,
              score: assessment.score,
              feedback: assessment.feedback
            }))
          : [],
        strengths: row.reportStrengths ? row.reportStrengths.split('\n') : [],
        improvements: row.reportImprovements ? row.reportImprovements.split('\n') : [],
        recommendations: row.reportRecommendations ? row.reportRecommendations.split('\n') : [],
        interviewDate: new Date(),
        duration: row.duration || 0,
        status: row.status as 'completed' | 'in_progress' | 'pending'
      }));
    } catch (error) {
      console.error('Error fetching candidate reports:', error);
      return [];
    }
  }

  async getJobAnalytics(recruiterId: string, jobId?: string) {
    try {
      const whereCondition = jobId
        ? and(
            eq(jobDescriptions.postedById, recruiterId),
            eq(interviewSessions.jobId, jobId)
          )
        : eq(jobDescriptions.postedById, recruiterId);

      const baseQuery = db
        .select({
          sessionId: interviewSessions.id,
          candidateId: interviewSessions.candidateId,
          jobId: interviewSessions.jobId,
          status: interviewSessions.status,
          jobTitle: jobDescriptions.title,
          overallScore: feedbackReports.overallScore
        })
        .from(interviewSessions)
        .leftJoin(jobDescriptions, eq(interviewSessions.jobId, jobDescriptions.id))
        .leftJoin(feedbackReports, eq(feedbackReports.sessionId, interviewSessions.id))
        .where(whereCondition);

      const sessions = await baseQuery;

      const analytics = {
        totalInterviews: sessions.length,
        completedInterviews: sessions.filter(s => s.status === 'completed').length,
        inProgressInterviews: sessions.filter(s => s.status === 'in_progress').length,
        pendingInterviews: sessions.filter(s => s.status === 'pending').length,
        averageScore: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length 
          : 0,
        topPerformers: sessions
          .filter(s => s.overallScore && s.overallScore >= 80)
          .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
          .slice(0, 10),
        interviewsThisWeek: sessions.filter(s => s.status === 'completed').length,
        scoreDistribution: {
          excellent: sessions.filter(s => s.overallScore && s.overallScore >= 90).length,
          good: sessions.filter(s => s.overallScore && s.overallScore >= 70 && s.overallScore < 90).length,
          average: sessions.filter(s => s.overallScore && s.overallScore >= 50 && s.overallScore < 70).length,
          below: sessions.filter(s => s.overallScore && s.overallScore < 50).length
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching job analytics:', error);
      return null;
    }
  }

  async updateJobStatus(jobId: string, recruiterId: string, isActive: boolean) {
    try {
      await db
        .update(jobDescriptions)
        .set({ isActive })
        .where(and(
          eq(jobDescriptions.id, jobId),
          eq(jobDescriptions.postedById, recruiterId)
        ));
      
      return true;
    } catch (error) {
      console.error('Error updating job status:', error);
      return false;
    }
  }

  async deleteJob(jobId: string, recruiterId: string) {
    try {
      await db
        .delete(jobDescriptions)
        .where(and(
          eq(jobDescriptions.id, jobId),
          eq(jobDescriptions.postedById, recruiterId)
        ));
      
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }

  private generateMockJobData(jobDescription: string): ExtractedJobData {
    // Extract common technical terms from job description
    const techSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
      'SQL', 'AWS', 'Docker', 'Git', 'REST APIs', 'Microservices'
    ];
    
    const foundSkills = techSkills.filter(skill => 
      jobDescription.toLowerCase().includes(skill.toLowerCase())
    );

    return {
      requiredSkills: foundSkills.length > 0 ? foundSkills.slice(0, 6) : [
        'Problem Solving', 'Communication', 'Teamwork'
      ],
      responsibilities: [
        'Develop and maintain software applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code'
      ],
      qualifications: [
        'Bachelor\'s degree in Computer Science or related field',
        '2+ years of professional experience',
        'Strong problem-solving skills'
      ],
      niceToHave: [
        'Experience with cloud platforms',
        'Knowledge of agile methodologies'
      ],
      companyInfo: 'Technology company focused on innovation',
      benefits: [
        'Competitive salary',
        'Health insurance',
        'Flexible working hours'
      ]
    };
  }
}

export const recruiterService = new RecruiterService();
