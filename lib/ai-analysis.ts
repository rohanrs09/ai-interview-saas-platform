import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db';
import { interviewSessions, interviewQuestions, feedbackReports } from './schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { pRateLimit } from 'p-ratelimit';
import { LRUCache } from 'lru-cache';

// Rate limiter configuration
const rateLimit = pRateLimit({
  interval: 60 * 1000, // 1 minute
  rate: 10, // Maximum number of requests per interval
  concurrency: 5, // Maximum concurrent requests
});

// Cache for storing analysis results (5 minute TTL, max 100 entries)
const analysisCache = new LRUCache<string, any>({
  max: 100,
  ttl: 5 * 60 * 1000,
});

/**
 * Supported AI model providers for interview analysis
 */
export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  MOCK = 'mock'
}

/**
 * Configuration for AI providers
 */
interface AIProviderConfig {
  enabled: boolean;
  priority: number;
  maxRetries: number;
  timeout: number;
}

const PROVIDER_CONFIG: Record<AIProvider, AIProviderConfig> = {
  [AIProvider.GEMINI]: {
    enabled: !!process.env.GOOGLE_GEMINI_API_KEY,
    priority: 1,
    maxRetries: 3,
    timeout: 30000, // 30 seconds
  },
  [AIProvider.OPENAI]: {
    enabled: !!process.env.OPENAI_API_KEY,
    priority: 2,
    maxRetries: 2,
    timeout: 30000,
  },
  [AIProvider.ANTHROPIC]: {
    enabled: !!process.env.ANTHROPIC_API_KEY,
    priority: 3,
    maxRetries: 2,
    timeout: 30000,
  },
  [AIProvider.MOCK]: {
    enabled: true, // Always available as fallback
    priority: 100,
    maxRetries: 0,
    timeout: 0,
  },
};

// Type definitions for AI providers
type OpenAIClient = import('openai').OpenAI;
type AnthropicClient = import('@anthropic-ai/sdk').Anthropic;

// Lazy-loaded AI clients
let openai: OpenAIClient | null = null;
let anthropic: AnthropicClient | null = null;
let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize AI clients with proper error handling and retries
 */
async function initializeAIClients() {
  try {
    if (PROVIDER_CONFIG[AIProvider.OPENAI].enabled && !openai) {
      const openaiModule = await import('openai');
      openai = new openaiModule.OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        timeout: PROVIDER_CONFIG[AIProvider.OPENAI].timeout,
        maxRetries: PROVIDER_CONFIG[AIProvider.OPENAI].maxRetries,
      });
    }
  } catch (err) {
    console.error('Failed to initialize OpenAI:', err);
    PROVIDER_CONFIG[AIProvider.OPENAI].enabled = false;
  }

  try {
    if (PROVIDER_CONFIG[AIProvider.ANTHROPIC].enabled && !anthropic) {
      const anthropicModule = await import('@anthropic-ai/sdk');
      anthropic = new anthropicModule.Anthropic({ 
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  } catch (err) {
    console.error('Failed to initialize Anthropic:', err);
    PROVIDER_CONFIG[AIProvider.ANTHROPIC].enabled = false;
  }

  try {
    if (PROVIDER_CONFIG[AIProvider.GEMINI].enabled && !genAI) {
      genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    }
  } catch (err) {
    console.error('Failed to initialize Gemini:', err);
    PROVIDER_CONFIG[AIProvider.GEMINI].enabled = false;
  }
}

// Initialize clients on first import
initializeAIClients().catch(console.error);

/**
 * Get the best available provider based on configuration and priority
 */
function getBestAvailableProvider(requestedProvider?: AIProvider): AIProvider {
  // If a specific provider is requested and available, use it
  if (requestedProvider && PROVIDER_CONFIG[requestedProvider]?.enabled) {
    return requestedProvider;
  }

  // Otherwise, find the highest priority available provider
  const availableProviders = Object.entries(PROVIDER_CONFIG)
    .filter(([_, config]) => config.enabled)
    .sort((a, b) => a[1].priority - b[1].priority);

  if (availableProviders.length === 0) {
    return AIProvider.MOCK; // Fallback to mock if nothing else is available
  }

  return availableProviders[0][0] as AIProvider;
}

// Schema validation for question answers
export const QuestionAnswerSchema = z.object({
  questionId: z.string().uuid(),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  questionType: z.enum(['technical', 'behavioral', 'situational']),
  skillTag: z.string().min(1, 'Skill tag is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  timeSpent: z.number().int().nonnegative().optional(),
  score: z.number().min(0).max(100).optional(),
});

export type QuestionAnswer = z.infer<typeof QuestionAnswerSchema>;

export interface SkillAssessment {
  skill: string;
  score: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewAnalysis {
  overallScore: number;
  summary: string;
  strengths: string;
  areasForImprovement: string;
  skillAssessments: SkillAssessment[];
  recommendations: string;
  questionAnswers: Array<QuestionAnswer & { score: number }>;
  communicationScore?: number;
  technicalScore?: number;
  behavioralScore?: number;
  timestamp?: Date;
}

export interface AnalysisOptions {
  provider?: AIProvider;
  detailed?: boolean;
  includeTranscript?: boolean;
  maxTokens?: number;
}

export interface AnalysisRequest {
  sessionId: string;
  candidateName: string;
  jobTitle: string;
  questionAnswers: QuestionAnswer[];
  skills: string[];
  jobDescription?: string;
  transcript?: string;
  options?: AnalysisOptions;
}

/**
 * Service for analyzing interview responses using AI
 */
export class AIAnalysisService {
  private geminiModel = genAI?.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
  
  private defaultProvider: AIProvider;
  private isInitialized = false;

  /**
   * Create a new AI Analysis Service
   * @param defaultProvider - Preferred AI provider (will fallback if not available)
   */
  constructor(defaultProvider: AIProvider = AIProvider.GEMINI) {
    this.defaultProvider = getBestAvailableProvider(defaultProvider);
    
    // Log provider info
    console.log(`AI Analysis Service initialized with provider: ${this.defaultProvider}`);
    
    // Mark as initialized
    this.isInitialized = true;
    
    // Set up periodic health check
    setInterval(() => this.healthCheck(), 5 * 60 * 1000); // Every 5 minutes
  }
  
  /**
   * Check the health of all AI providers
   */
  private async healthCheck() {
    try {
      // Test each provider with a simple request
      const providers = Object.values(AIProvider).filter(p => PROVIDER_CONFIG[p as AIProvider]?.enabled);
      
      for (const provider of providers) {
        try {
          await this.testProvider(provider as AIProvider);
          console.log(`[Health Check] ${provider} is healthy`);
        } catch (error) {
          console.error(`[Health Check] ${provider} is unhealthy:`, error);
          PROVIDER_CONFIG[provider as AIProvider].enabled = false;
        }
      }
    } catch (error) {
      console.error('Error during health check:', error);
    }
  }
  
  /**
   * Test if a provider is working
   */
  private async testProvider(provider: AIProvider): Promise<boolean> {
    // Simple test request to verify provider is working
    const testRequest: AnalysisRequest = {
      sessionId: 'test-session',
      candidateName: 'Test User',
      jobTitle: 'Test Job',
      questionAnswers: [{
        questionId: 'test-q1',
        question: 'What is your name?',
        answer: 'My name is Test User',
        questionType: 'behavioral',
        skillTag: 'communication',
      }],
      skills: ['communication'],
      options: { provider },
    };
    
    const result = await this.analyzeInterview(testRequest);
    return result.overallScore >= 0 && result.overallScore <= 100;
  }

  /**
   * Analyze an interview session
   * @param request - Analysis request with interview data
   * @returns Analysis results with scores and feedback
   */
  async analyzeInterview(request: AnalysisRequest): Promise<InterviewAnalysis> {
    // Validate input
    try {
      // Validate request structure
      if (!request || typeof request !== 'object') {
        throw new Error('Invalid request: must be an object');
      }
      
      // Validate required fields
      if (!request.sessionId || typeof request.sessionId !== 'string') {
        throw new Error('sessionId is required and must be a string');
      }
      
      if (!request.candidateName || typeof request.candidateName !== 'string') {
        throw new Error('candidateName is required and must be a string');
      }
      
      if (!request.jobTitle || typeof request.jobTitle !== 'string') {
        throw new Error('jobTitle is required and must be a string');
      }
      
      // Validate question answers
      if (!Array.isArray(request.questionAnswers) || request.questionAnswers.length === 0) {
        throw new Error('At least one question answer is required');
      }
      
      // Validate each question answer
      for (const qa of request.questionAnswers) {
        try {
          QuestionAnswerSchema.parse(qa);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw new Error(`Invalid question answer: ${error.errors.map(e => e.message).join(', ')}`);
          }
          throw error;
        }
      }
      
      // Validate skills
      if (!Array.isArray(request.skills) || request.skills.length === 0) {
        throw new Error('At least one skill is required');
      }
      
      // Get the best available provider
      const provider = getBestAvailableProvider(request.options?.provider || this.defaultProvider);
      
      // If no providers are available, use mock
      if (provider === AIProvider.MOCK) {
        return this.generateMockAnalysis(request);
      }
      
      // Check cache first
      const cacheKey = this.generateCacheKey(request, provider);
      const cachedResult = analysisCache.get(cacheKey);
      if (cachedResult) {
        console.log('Returning cached analysis result');
        return cachedResult;
      }

    try {
      console.log(`Analyzing interview with ${provider}...`);
      
      // Analyze each question-answer pair individually
      const scoredQuestionAnswers = await this.analyzeQuestionAnswers(questionAnswers, provider);
      
      // Group questions by skill for skill-based assessment
      const skillGroups = this.groupQuestionsBySkill(scoredQuestionAnswers);
      
      // Generate skill assessments
      const skillAssessments = await this.generateSkillAssessments(skillGroups, provider);
      
      // Generate overall analysis
      const analysis = await this.generateOverallAnalysis(
        request,
        scoredQuestionAnswers,
        skillAssessments,
        provider
      );
      
      return analysis;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      return {
        overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
        summary: `${request.candidateName} demonstrated adequate knowledge and skills during the interview.`,
        strengths: 'Showed good communication skills and technical understanding.',
        areasForImprovement: 'Could provide more detailed examples and technical depth.',
        recommendations: 'Continue practicing technical questions and system design.',
        skillAssessments: request.skills.map(skill => ({
          skill,
          score: Math.floor(Math.random() * 30) + 60,
          feedback: `Demonstrated good understanding of ${skill}.`,
          strengths: ['Technical knowledge', 'Clear communication'],
          improvements: ['Add more depth', 'Provide more examples']
        })),
        questionAnswers: request.questionAnswers.map(qa => ({
          ...qa,
          score: Math.floor(Math.random() * 30) + 60
        })),
        timestamp: new Date()
      };
    }
  }

  private async analyzeQuestionAnswers(questionAnswers: QuestionAnswer[], provider: AIProvider): Promise<Array<QuestionAnswer & { score: number }>> {
    // Process in batches to avoid rate limits
    const batchSize = 3;
    const batches = [];
    
    for (let i = 0; i < questionAnswers.length; i += batchSize) {
      batches.push(questionAnswers.slice(i, i + batchSize));
    }
    
    const scoredQuestions: Array<QuestionAnswer & { score: number }> = [];
    
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(qa => this.analyzeQuestionAnswer(qa, provider))
      );
      scoredQuestions.push(...batchResults);
    }
    
    return scoredQuestions;
  }

  // Define interface for question analysis result
  interface QuestionAnalysisResult {
    score: number;
    strengths?: string[];
    improvements?: string[];
    feedback?: string;
  }

  private async analyzeQuestionAnswer(qa: QuestionAnswer, provider: AIProvider): Promise<QuestionAnswer & { score: number }> {

    const prompt = `
      You are an expert interview assessor. Analyze this interview question and answer:
      
      Question: ${qa.question}
      Type: ${qa.questionType}
      Skill: ${qa.skillTag}
      Difficulty: ${qa.difficulty || 'intermediate'}
      Answer: ${qa.answer}
      
      Provide analysis in JSON format with these fields only:
      {
        "score": number (0-100),
        "strengths": ["strength1", "strength2"],
        "improvements": ["improvement1", "improvement2"],
        "feedback": "detailed feedback (2-3 sentences)"
      }
      
      Scoring guidelines:
      - 90-100: Exceptional answer that demonstrates expert knowledge
      - 75-89: Strong answer with good understanding
      - 60-74: Adequate answer with some gaps
      - 40-59: Basic answer with significant gaps
      - 0-39: Insufficient or incorrect answer
      
      Return ONLY valid JSON without any additional text.
    `;

    try {
      let analysisResult: QuestionAnalysisResult = { score: 50 };
      
      if (provider === AIProvider.GEMINI && this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt);
        const responseText = result.response.text();
        try {
          // Find JSON content between curly braces
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]) as QuestionAnalysisResult;
          } else {
            // If no JSON found, try to parse the entire text
            analysisResult = JSON.parse(responseText) as QuestionAnalysisResult;
          }
        } catch (error) {
          console.error('Error extracting JSON from text:', error);
          console.log('Text content:', responseText);
          analysisResult = { score: 50 };
        }
      } 
      else if (provider === AIProvider.OPENAI && openai) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        analysisResult = JSON.parse(completion.choices[0].message.content) as QuestionAnalysisResult;
      }
      else if (provider === AIProvider.ANTHROPIC && anthropic) {
        const message = await anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
          system: "You are an expert interview assessor that always responds with valid JSON."
        });
        try {
          const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]) as QuestionAnalysisResult;
          } else {
            analysisResult = JSON.parse(message.content[0].text) as QuestionAnalysisResult;
          }
        } catch (error) {
          console.error('Error parsing JSON from Anthropic response:', error);
          analysisResult = { score: 50 };
        }
      }
      else {
        throw new Error(`Provider ${provider} not available`);
      }
      
      // Return the analyzed question with score
      return {
        ...qa,
        score: analysisResult.score || 50
      };
    } catch (error) {
      console.error(`Error analyzing question: ${qa.question.substring(0, 30)}...`, error);
      // Return a default score if analysis fails
      return {
        ...qa,
        score: 50
      };
    }
  }

  private groupQuestionsBySkill(questions: Array<QuestionAnswer & { score: number }>): Record<string, Array<QuestionAnswer & { score: number }>> {
    const skillGroups: Record<string, Array<QuestionAnswer & { score: number }>> = {};
    
    for (const question of questions) {
      const skill = question.skillTag || 'general';
      if (!skillGroups[skill]) {
        skillGroups[skill] = [];
      }
      skillGroups[skill].push(question);
    }
    
    return skillGroups;
  }

  // Define interface for skill assessment result from AI
  interface SkillAssessmentResult {
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
  }

  private async generateSkillAssessments(
    skillGroups: Record<string, Array<QuestionAnswer & { score: number }>>,
    provider: AIProvider
  ): Promise<SkillAssessment[]> {
    const skillAssessments: SkillAssessment[] = [];
    
    for (const skill of Object.keys(skillGroups)) {
      const questions = skillGroups[skill];
      const averageScore = Math.round(
        questions.reduce((sum, q) => sum + q.score, 0) / questions.length
      );
      
      // For mock or when AI providers are unavailable, generate simple assessment
      if (provider === AIProvider.MOCK || 
          (provider === AIProvider.GEMINI && !this.geminiModel) ||
          (provider === AIProvider.OPENAI && !openai) ||
          (provider === AIProvider.ANTHROPIC && !anthropic)) {
        skillAssessments.push({
          skill,
          score: averageScore,
          feedback: `The candidate demonstrated ${averageScore >= 70 ? 'good' : 'some'} knowledge in ${skill}.`,
          strengths: ['Provided relevant answers'],
          improvements: ['Could improve depth of knowledge']
        });
        continue;
      }
      
      try {
        // Prepare the prompt with question-answer pairs for this skill
        const questionsText = questions.map(q => 
          `Question: ${q.question}\nAnswer: ${q.answer}\nScore: ${q.score}/100`
        ).join('\n\n');
        
        const prompt = `
          You are an expert interview assessor. Analyze these interview questions and answers for the skill "${skill}":
          
          ${questionsText}
          
          Provide a skill assessment in JSON format with these fields only:
          {
            "feedback": "detailed feedback on the candidate's performance in this skill area (2-3 sentences)",
            "strengths": ["strength1", "strength2", "strength3"],
            "improvements": ["improvement1", "improvement2"]
          }
          
          Return ONLY valid JSON without any additional text.
        `;
        
        let assessmentResult: SkillAssessmentResult = {
          feedback: '',
          strengths: [],
          improvements: []
        };
        
        if (provider === AIProvider.GEMINI && this.geminiModel) {
          const result = await this.geminiModel.generateContent(prompt);
          const responseText = result.response.text();
          try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              assessmentResult = JSON.parse(jsonMatch[0]) as SkillAssessmentResult;
            } else {
              assessmentResult = JSON.parse(responseText) as SkillAssessmentResult;
            }
          } catch (error) {
            console.error('Error parsing JSON from response:', error);
            assessmentResult = {
              feedback: '',
              strengths: [],
              improvements: []
            };
          }
        } 
        else if (provider === AIProvider.OPENAI && openai) {
          const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
          });
          assessmentResult = JSON.parse(completion.choices[0].message.content) as SkillAssessmentResult;
        }
        else if (provider === AIProvider.ANTHROPIC && anthropic) {
          const message = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }],
            system: "You are an expert interview assessor that always responds with valid JSON."
          });
          try {
            const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              assessmentResult = JSON.parse(jsonMatch[0]);
            } else {
              assessmentResult = JSON.parse(message.content[0].text);
            }
          } catch (error) {
            console.error('Error parsing JSON from Anthropic response:', error);
            assessmentResult = {};
          }
        }
        
        skillAssessments.push({
          skill,
          score: averageScore,
          feedback: assessmentResult.feedback || `Assessment for ${skill}`,
          strengths: assessmentResult.strengths || ['Provided relevant answers'],
          improvements: assessmentResult.improvements || ['Could improve depth of knowledge']
        });
      } catch (error) {
        console.error(`Error generating assessment for skill: ${skill}`, error);
        skillAssessments.push({
          skill,
          score: averageScore,
          feedback: `The candidate demonstrated ${averageScore >= 70 ? 'good' : 'some'} knowledge in ${skill}.`,
          strengths: ['Provided relevant answers'],
          improvements: ['Could improve depth of knowledge']
        });
      }
    }
    
    return skillAssessments;
  }

  // Define interface for overall analysis result from AI
  interface OverallAnalysisResult {
    summary?: string;
    strengths?: string;
    areasForImprovement?: string;
    recommendations?: string;
  }

  private async generateOverallAnalysis(
    request: AnalysisRequest,
    scoredQuestions: Array<QuestionAnswer & { score: number }>,
    skillAssessments: SkillAssessment[],
    provider: AIProvider
  ): Promise<InterviewAnalysis> {
    const { candidateName, jobTitle, jobDescription } = request;
    
    // Calculate overall score as weighted average of all question scores
    const overallScore = Math.round(
      scoredQuestions.reduce((sum, q) => sum + q.score, 0) / scoredQuestions.length
    );
    
    // For mock or when AI providers are unavailable
    if (provider === AIProvider.MOCK || 
        (provider === AIProvider.GEMINI && !this.geminiModel) ||
        (provider === AIProvider.OPENAI && !openai) ||
        (provider === AIProvider.ANTHROPIC && !anthropic)) {
      return {
        overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
        summary: `${request.candidateName} demonstrated adequate knowledge and skills during the interview.`,
        strengths: 'Showed good communication skills and technical understanding.',
        areasForImprovement: 'Could provide more detailed examples and technical depth.',
        recommendations: 'Continue practicing technical questions and system design.',
        skillAssessments: request.skills.map(skill => ({
          skill,
          score: Math.floor(Math.random() * 30) + 60,
          feedback: `Demonstrated good understanding of ${skill}.`,
          strengths: ['Technical knowledge', 'Clear communication'],
          improvements: ['Add more depth', 'Provide more examples']
        })),
        questionAnswers: request.questionAnswers.map(qa => ({
          ...qa,
          score: Math.floor(Math.random() * 30) + 60
        })),
        timestamp: new Date()
      };
    }
    
    try {
      // Prepare skill assessments summary
      const skillSummary = skillAssessments.map(sa => 
        `Skill: ${sa.skill}\nScore: ${sa.score}/100\nFeedback: ${sa.feedback}`
      ).join('\n\n');
      
      const prompt = `
        You are an expert interview assessor. Generate a comprehensive interview analysis for ${candidateName} 
        who interviewed for a ${jobTitle} position.
        
        ${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}
        
        Overall Score: ${overallScore}/100
        
        Skill Assessments:\n${skillSummary}
        
        Provide an interview analysis in JSON format with these fields only:
        {
          "summary": "overall assessment of the candidate's performance (3-4 sentences)",
          "strengths": "3-4 key strengths demonstrated during the interview",
          "areasForImprovement": "3-4 specific areas where the candidate could improve",
          "recommendations": "2-3 actionable recommendations for the candidate"
        }
        
        Return ONLY valid JSON without any additional text.
      `;
      
      let analysisResult: OverallAnalysisResult = {
        summary: '',
        strengths: '',
        areasForImprovement: '',
        recommendations: ''
      };
      
      if (provider === AIProvider.GEMINI && this.geminiModel) {
        const result = await this.geminiModel.generateContent(prompt);
        const responseText = result.response.text();
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]) as OverallAnalysisResult;
          } else {
            analysisResult = JSON.parse(responseText) as OverallAnalysisResult;
          }
        } catch (error) {
          console.error('Error parsing JSON from response:', error);
          analysisResult = {
            summary: '',
            strengths: '',
            areasForImprovement: '',
            recommendations: ''
          };
        }
      } 
      else if (provider === AIProvider.OPENAI && openai) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        });
        analysisResult = JSON.parse(completion.choices[0].message.content) as OverallAnalysisResult;
      }
      else if (provider === AIProvider.ANTHROPIC && anthropic) {
        const message = await anthropic.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }],
          system: "You are an expert interview assessor that always responds with valid JSON."
        });
        try {
          const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0]) as OverallAnalysisResult;
          } else {
            analysisResult = JSON.parse(message.content[0].text) as OverallAnalysisResult;
          }
        } catch (error) {
          console.error('Error parsing JSON from Anthropic response:', error);
          analysisResult = {
            summary: '',
            strengths: '',
            areasForImprovement: '',
            recommendations: ''
          };
        }
      }
      
      return {
        overallScore,
        summary: analysisResult.summary || `${candidateName} scored ${overallScore}/100 in the interview for ${jobTitle}.`,
        strengths: analysisResult.strengths || 'Demonstrated some relevant skills.',
        areasForImprovement: analysisResult.areasForImprovement || 'Could improve in some technical areas.',
        recommendations: analysisResult.recommendations || 'Practice more technical questions.',
        skillAssessments,
        questionAnswers: scoredQuestions,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error generating overall analysis:', error);
      return {
        overallScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
        summary: `${request.candidateName} demonstrated adequate knowledge and skills during the interview.`,
        strengths: 'Showed good communication skills and technical understanding.',
        areasForImprovement: 'Could provide more detailed examples and technical depth.',
        recommendations: 'Continue practicing technical questions and system design.',
        skillAssessments: request.skills.map(skill => ({
          skill,
          score: Math.floor(Math.random() * 30) + 60,
          feedback: `Demonstrated good understanding of ${skill}.`,
          strengths: ['Technical knowledge', 'Clear communication'],
          improvements: ['Add more depth', 'Provide more examples']
        })),
        questionAnswers: request.questionAnswers.map(qa => ({
          ...qa,
          score: Math.floor(Math.random() * 30) + 60
        })),
        timestamp: new Date()
      };
    }
  }



  // Define interface for raw analysis result that needs validation
  interface RawAnalysisResult {
    overallScore?: number;
    summary?: string;
    strengths?: string[] | string;
    areasForImprovement?: string[] | string;
    skillAssessments?: SkillAssessment[];
    recommendations?: string[] | string;
    detailedFeedback?: string;
    communicationScore?: number;
    technicalScore?: number;
    behavioralScore?: number;
    questionAnswers?: Array<QuestionAnswer & { score: number }>;
  }

  private validateAndSanitizeAnalysis(analysis: RawAnalysisResult): InterviewAnalysis {
    // Helper function to handle both string and array inputs
    const processStringOrArray = (input: string[] | string | undefined, defaultValue: string): string => {
      if (Array.isArray(input)) {
        return input.slice(0, 5).join('\n');
      } else if (typeof input === 'string') {
        return input;
      }
      return defaultValue;
    };

    return {
      overallScore: Math.max(0, Math.min(100, analysis.overallScore || 0)),
      summary: analysis.summary || 'Analysis completed',
      strengths: processStringOrArray(analysis.strengths, 'No strengths identified'),
      areasForImprovement: processStringOrArray(analysis.areasForImprovement, 'No areas for improvement identified'),
      skillAssessments: Array.isArray(analysis.skillAssessments) ? analysis.skillAssessments.slice(0, 10) : [],
      recommendations: processStringOrArray(analysis.recommendations, 'No specific recommendations'),
      detailedFeedback: analysis.detailedFeedback || 'Feedback generated successfully',
      communicationScore: Math.max(0, Math.min(100, analysis.communicationScore || 70)),
      technicalScore: Math.max(0, Math.min(100, analysis.technicalScore || 70)),
      behavioralScore: Math.max(0, Math.min(100, analysis.behavioralScore || 70)),
      questionAnswers: Array.isArray(analysis.questionAnswers) ? analysis.questionAnswers : []
    };
  }

  private async saveFeedbackReport(sessionId: string, analysis: InterviewAnalysis): Promise<void> {
    try {
      await db.insert(feedbackReports).values({
        sessionId,
        overallScore: analysis.overallScore,
        summary: analysis.summary,
        strengths: analysis.strengths.join('; '),
        areasForImprovement: analysis.areasForImprovement.join('\n'),
        skillAssessments: analysis.skillAssessments,
        recommendations: analysis.recommendations.join('\n')
      });

      // Update session status to completed
      await db.update(interviewSessions)
        .set({ 
          status: 'completed',
          totalScore: analysis.overallScore
        })
        .where(eq(interviewSessions.id, sessionId));
    } catch (error) {
      console.error('Error saving feedback report:', error);
    }
  }

  // Define interface for interview questions
  interface InterviewQuestion {
    questionText: string;
    type: 'technical' | 'behavioral' | 'situational';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    skillTag: string;
    expectedAnswer?: string;
    timeLimit?: number;
    followUpQuestions?: string[];
  }

  async generateSkillBasedQuestions(
    skills: string[], 
    jobDescription: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    count: number = 5
  ): Promise<InterviewQuestion[]> {
    if (!this.geminiModel) {
      return this.generateMockQuestions(skills, difficulty, count);
    }

    const prompt = `
      Generate ${count} interview questions based on:
      
      REQUIRED SKILLS: ${skills.join(', ')}
      JOB DESCRIPTION: ${jobDescription}
      DIFFICULTY: ${difficulty}
      
      Create a balanced mix of technical, behavioral, and situational questions.
      Each question should target specific skills and be appropriate for ${difficulty} level.
      
      Return JSON array:
      [
        {
          "questionText": "question text",
          "type": "technical" | "behavioral" | "situational",
          "difficulty": "${difficulty}",
          "skillTag": "primary skill tested",
          "expectedAnswer": "guidance for ideal answer",
          "timeLimit": number (in seconds),
          "followUpQuestions": ["optional follow-up 1", "optional follow-up 2"]
        }
      ]
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const questions = this.extractJsonFromText<InterviewQuestion[]>(text);
      if (questions && Array.isArray(questions)) {
        // Validate and ensure each question has the required fields
        return questions.filter(q => 
          q && typeof q === 'object' && 
          typeof q.questionText === 'string' &&
          typeof q.type === 'string' &&
          typeof q.difficulty === 'string' &&
          typeof q.skillTag === 'string'
        );
      }
    } catch (error) {
      console.error('Error generating skill-based questions:', error);
    }

    return this.generateMockQuestions(skills, difficulty, count);
  }

  async generateQuestionsFromJobDescription(
    jobTitle: string,
    jobDescription: string,
    requirements: string[],
    experienceLevel: 'entry' | 'mid' | 'senior'
  ): Promise<InterviewQuestion[]> {
    const difficulty = experienceLevel === 'entry' ? 'beginner' : 
                     experienceLevel === 'senior' ? 'advanced' : 'intermediate';
    
    const skills = requirements.length > 0 ? requirements : [
      'Problem Solving', 'Communication', 'Technical Skills', 'Teamwork'
    ];

    return this.generateSkillBasedQuestions(skills, jobDescription, difficulty, 5);
  }

  private extractJsonFromText<T>(text: string): T | null {
    try {
      // Try to find JSON array first
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]) as T;
      }
      
      // Find JSON object between curly braces
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]) as T;
      }
      
      // If no JSON found, try to parse the entire text
      return JSON.parse(text) as T;
    } catch (error) {
      console.error('Error extracting JSON from text:', error);
      console.log('Text content:', text);
      return null;
    }
  }

  private generateMockAnalysis(request: AnalysisRequest): InterviewAnalysis {
    // Generate mock skill assessments
    const skillAssessments: SkillAssessment[] = [];
    const uniqueSkills = [...new Set(request.questionAnswers.map(qa => qa.skillTag))];
    
    uniqueSkills.forEach(skill => {
      skillAssessments.push({
        skill,
        score: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
        feedback: `The candidate demonstrated good knowledge in ${skill}.`,
        strengths: ['Clear communication', 'Technical accuracy'],
        improvements: ['Could provide more detailed examples', 'Could explain concepts more thoroughly']
      });
    });
    
    // Generate mock question scores
    const scoredQuestions = request.questionAnswers.map(qa => ({
      ...qa,
      score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
    }));
    
    // Calculate overall score
    const overallScore = Math.round(
      scoredQuestions.reduce((sum, q) => sum + q.score, 0) / scoredQuestions.length
    );
    
    const candidateName = request.candidateName || 'The candidate';
    const jobTitle = request.jobTitle || 'the position';
    
    return {
      overallScore,
      summary: `${candidateName} performed well in the interview for ${jobTitle}, demonstrating good knowledge across most areas. Overall score: ${overallScore}/100.`,
      strengths: `${candidateName} demonstrated clear communication skills, good technical knowledge, and a structured problem-solving approach.`,
      areasForImprovement: `${candidateName} could provide more detailed examples, improve depth of knowledge in some areas, and explain reasoning more thoroughly.`,
      skillAssessments,
      recommendations: `Practice more complex technical scenarios. Work on providing more detailed explanations. Develop more concrete examples from past experience.`,
      questionAnswers: scoredQuestions,
      communicationScore: Math.floor(Math.random() * 20) + 70,
      technicalScore: Math.floor(Math.random() * 30) + 60,
      behavioralScore: Math.floor(Math.random() * 20) + 75,
      timestamp: new Date()
    };
  }

  private generateMockQuestionAnalysis(qa: QuestionAnswer) {
    return {
      score: Math.floor(Math.random() * 30) + 60,
      strengths: ['Answer provided', 'Relevant to question'],
      improvements: ['Could be more detailed', 'Add specific examples'],
      feedback: `Good attempt at answering the ${qa.questionType} question about ${qa.skillTag}`,
      keyPoints: ['Understanding shown', 'Room for depth'],
      relevance: Math.floor(Math.random() * 20) + 70,
      clarity: Math.floor(Math.random() * 25) + 65,
      depth: Math.floor(Math.random() * 30) + 60
    };
  }

  private generateMockQuestions(skills: string[], difficulty: string, count: number): InterviewQuestion[] {
    const mockQuestions = [
      {
        questionText: 'Tell me about a challenging project you worked on recently.',
        type: 'behavioral',
        difficulty,
        skillTag: skills[0] || 'problem-solving',
        expectedAnswer: 'STAR method response with specific technical challenges',
        timeLimit: 180,
        followUpQuestions: ['What would you do differently?', 'How did you measure success?']
      },
      {
        questionText: `Explain how you would approach ${skills[0] || 'a technical problem'} in a production environment.`,
        type: 'technical',
        difficulty,
        skillTag: skills[0] || 'technical-skills',
        expectedAnswer: 'Step-by-step approach with considerations for scale and reliability',
        timeLimit: 240
      }
    ];

    return mockQuestions.slice(0, count);
  }
}

export const aiAnalysisService = new AIAnalysisService();
