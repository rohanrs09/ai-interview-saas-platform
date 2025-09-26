import Vapi from '@vapi-ai/web';

export interface VapiConfig {
  assistant: {
    model: {
      provider: 'openai' | 'anthropic' | 'google';
      model: string;
      messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
      }>;
      functions?: Array<{
        name: string;
        description: string;
        parameters: Record<string, any>;
      }>;
    };
    voice: {
      provider: 'playht' | '11labs' | 'azure';
      voiceId: string;
    };
    transcriber: {
      provider: 'deepgram';
      model: 'nova-2';
      language: 'en';
      options?: Record<string, any>;
    };
  };
}

export interface InterviewContext {
  sessionId: string;
  questions: Array<{
    id: string;
    text: string;
    questionType: 'technical' | 'behavioral' | 'situational';
    skillTag: string;
    timeLimit?: number; // in seconds
  }>;
  currentQuestionIndex: number;
  candidateName: string;
  jobTitle: string;
  jobDescription?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  expectedDuration?: number; // in minutes
}

export interface VapiTranscript {
  timestamp: number;
  speaker: 'assistant' | 'user';
  text: string;
  confidence?: number;
  questionId?: string; // Associated question ID
  duration?: number; // Duration of this segment in ms
  emotion?: string; // Optional emotion detection
}

export class VapiService {
  private vapi: any;
  private context: InterviewContext | null = null;
  private transcripts: VapiTranscript[] = [];
  private isCallActive = false;

  constructor() {
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      console.warn('VAPI_PUBLIC_KEY is not set, using mock mode');
      this.vapi = this.createMockVapi();
      return;
    }
    this.vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);
  }
  
  private createMockVapi() {
    // Create a mock implementation for development without API key
    return {
      start: async () => {
        console.log('Mock Vapi: Starting call');
        setTimeout(() => this.mockCallStart(), 1000);
        return true;
      },
      stop: async () => {
        console.log('Mock Vapi: Stopping call');
        setTimeout(() => this.mockCallEnd(), 500);
        return true;
      },
      on: (event: string, callback: Function) => {
        console.log(`Mock Vapi: Registered listener for ${event}`);
        if (typeof window !== 'undefined') {
          window.addEventListener(`mock-vapi-${event}`, ((e: CustomEvent) => callback(e.detail)) as EventListener);
        }
      }
    };
  }
  
  private mockCallStart() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock-vapi-call-start'));
      
      // Simulate some transcripts
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('mock-vapi-transcript', { 
          detail: { role: 'assistant', transcript: 'Hello, welcome to your interview. Could you please introduce yourself?' }
        }));
      }, 2000);
    }
  }
  
  private mockCallEnd() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mock-vapi-call-end'));
    }
  }

  async startVoiceInterview(context: InterviewContext): Promise<void> {
    this.context = context;
    this.transcripts = [];

    const config = this.createInterviewConfig(context);
    
    try {
      // Dispatch event before starting to allow UI preparation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vapi-interview-starting', { 
          detail: { context }
        }));
      }
      
      await this.vapi.start(config);
      this.isCallActive = true;
      this.setupEventListeners();
      
      // Dispatch event after successful start
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vapi-interview-started', { 
          detail: { context }
        }));
      }
    } catch (error) {
      console.error('Error starting Vapi voice interview:', error);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vapi-error', { 
          detail: { error: error instanceof Error ? error.message : 'Failed to start interview' }
        }));
      }
      throw new Error('Failed to start voice interview. Please check your connection and try again.');
    }
  }

  private createInterviewConfig(context: InterviewContext): VapiConfig {
    const systemMessage = this.generateSystemPrompt(context);
    
    // Define interview functions for the AI to use
    const interviewFunctions = [
      {
        name: 'next_question',
        description: 'Move to the next interview question',
        parameters: {
          type: 'object',
          properties: {
            feedback: {
              type: 'string',
              description: 'Brief feedback on the previous answer'
            }
          },
          required: ['feedback']
        }
      },
      {
        name: 'end_interview',
        description: 'End the interview with concluding remarks',
        parameters: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Brief summary of the interview'
            }
          },
          required: ['summary']
        }
      }
    ];
    
    // Use Claude if available, otherwise fallback to GPT
    const useAnthropic = process.env.NEXT_PUBLIC_USE_ANTHROPIC === 'true';
    
    return {
      assistant: {
        model: {
          provider: useAnthropic ? 'anthropic' : 'openai',
          model: useAnthropic ? 'claude-3-opus-20240229' : 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: systemMessage
            }
          ],
          functions: interviewFunctions
        },
        voice: {
          provider: '11labs',
          voiceId: 'emily' // Professional female voice with natural intonation
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en',
          options: {
            smart_format: true,
            diarize: true,
            punctuate: true
          }
        }
      }
    };
  }

  private generateSystemPrompt(context: InterviewContext): string {
    const questions = context.questions.map((q, index) => 
      `${index + 1}. ${q.text} (${q.questionType} - ${q.skillTag}${q.timeLimit ? ` - ${q.timeLimit}s time limit` : ''})`
    ).join('\n');

    const jobContext = context.jobDescription 
      ? `\n\nJOB DESCRIPTION:\n${context.jobDescription}` 
      : '';

    return `You are conducting a professional mock interview for ${context.candidateName} applying for a ${context.jobTitle} position.${jobContext}

INTERVIEW STRUCTURE:\n${questions}

INSTRUCTIONS:
1. Start by greeting the candidate warmly and introducing yourself as an AI Interview Assistant
2. Explain the interview process and that you'll be asking ${context.questions.length} questions
3. Ask questions one by one in the exact order provided, waiting for complete answers
4. Provide brief encouraging feedback after each answer (1-2 sentences)
5. Use the next_question function to move to the next question after providing feedback
6. Ask ONE relevant follow-up question if answers need clarification
7. Keep your responses concise and professional (under 30 seconds of speaking)
8. Use the end_interview function when all questions are completed
9. Adapt your technical depth based on the difficulty level: ${context.difficulty || 'intermediate'}

TONE: Professional, encouraging, and conversational
PACE: Moderate speaking pace with clear articulation
BEHAVIOR: Allow natural pauses, don't interrupt, provide supportive feedback

Begin the interview now by introducing yourself and explaining the process.`;
  }

  private setupEventListeners(): void {
    this.vapi.on('call-start', () => {
      console.log('Voice interview started');
      this.isCallActive = true;
    });

    this.vapi.on('call-end', () => {
      console.log('Voice interview ended');
      this.isCallActive = false;
      this.saveTranscripts();
    });

    this.vapi.on('speech-start', () => {
      console.log('Speech detected');
    });

    this.vapi.on('speech-end', () => {
      console.log('Speech ended');
    });

    this.vapi.on('transcript', (transcript: any) => {
      const vapiTranscript: VapiTranscript = {
        timestamp: Date.now(),
        speaker: transcript.role === 'assistant' ? 'assistant' : 'user',
        text: transcript.transcript || transcript.text,
        confidence: transcript.confidence
      };
      
      this.transcripts.push(vapiTranscript);
      console.log('Transcript:', vapiTranscript);
    });

    this.vapi.on('message', (message: any) => {
      console.log('Vapi message:', message);
      
      if (message.type === 'function-call') {
        this.handleFunctionCall(message);
      }
    });

    this.vapi.on('error', (error: any) => {
      console.error('Vapi error:', error);
      this.handleError(error);
    });

    this.vapi.on('volume-level', (volume: number) => {
      // Can be used for audio visualization
      console.log('Volume level:', volume);
    });
  }

  private handleFunctionCall(message: any): void {
    if (!message.function_call || !this.context) return;
    
    const { name, parameters } = message.function_call;
    console.log(`Function call received: ${name}`, parameters);
    
    switch (name) {
      case 'next_question':
        this.handleNextQuestion(parameters);
        break;
      case 'end_interview':
        this.handleEndInterview(parameters);
        break;
      default:
        console.warn(`Unknown function call: ${name}`);
    }
  }
  
  private handleNextQuestion(parameters: any): void {
    if (!this.context) return;
    
    // Update current question index
    const nextIndex = this.context.currentQuestionIndex + 1;
    if (nextIndex < this.context.questions.length) {
      this.context.currentQuestionIndex = nextIndex;
      
      // Dispatch event for UI update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vapi-question-change', { 
          detail: { 
            questionIndex: nextIndex,
            question: this.context.questions[nextIndex],
            feedback: parameters.feedback
          }
        }));
      }
    }
  }
  
  private handleEndInterview(parameters: any): void {
    // Dispatch event for interview completion
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vapi-interview-complete', { 
        detail: { summary: parameters.summary }
      }));
      
      // Auto-end the call after a short delay
      setTimeout(() => this.endCall(), 5000);
    }
  }

  private handleError(error: any): void {
    console.error('Voice interview error:', error);
    this.isCallActive = false;
    
    // Notify the UI about the error
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vapi-error', { 
        detail: { error: error.message || 'Voice interview error occurred' }
      }));
    }
  }

  async endCall(): Promise<VapiTranscript[]> {
    try {
      if (this.isCallActive) {
        await this.vapi.stop();
      }
      return this.transcripts;
    } catch (error) {
      console.error('Error ending Vapi call:', error);
      throw error;
    }
  }

  private async saveTranscripts(): Promise<void> {
    if (!this.context || this.transcripts.length === 0) return;

    try {
      // Process transcripts to associate with questions
      const processedTranscripts = this.processTranscriptsWithQuestions();
      
      const response = await fetch('/api/interviews/save-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.context.sessionId,
          transcripts: processedTranscripts,
          duration: this.getInterviewDuration(),
          questionCount: this.context.questions.length,
          completedQuestions: Math.min(this.context.currentQuestionIndex + 1, this.context.questions.length)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save transcripts:', errorData);
        throw new Error(errorData.error || 'Failed to save interview data');
      }
      
      // Notify UI that transcripts were saved successfully
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('vapi-transcripts-saved', { 
          detail: { sessionId: this.context.sessionId }
        }));
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving transcripts:', error);
      throw error;
    }
  }
  
  private processTranscriptsWithQuestions(): VapiTranscript[] {
    if (!this.context || this.transcripts.length === 0) return this.transcripts;
    
    // Clone transcripts to avoid modifying originals
    const processed = [...this.transcripts];
    
    // Map assistant questions to the corresponding question IDs
    let currentQuestionIndex = -1; // Start with introduction
    
    for (let i = 0; i < processed.length; i++) {
      const transcript = processed[i];
      
      // Only process assistant transcripts
      if (transcript.speaker === 'assistant') {
        // Check if this transcript contains a question from our list
        for (let q = 0; q < this.context.questions.length; q++) {
          const question = this.context.questions[q];
          
          // Simple heuristic: if transcript contains significant portion of the question text
          if (transcript.text.includes(question.text.substring(0, Math.min(50, question.text.length)))) {
            currentQuestionIndex = q;
            transcript.questionId = question.id;
            break;
          }
        }
      } else if (transcript.speaker === 'user' && currentQuestionIndex >= 0 && currentQuestionIndex < this.context.questions.length) {
        // Associate user responses with the current question
        transcript.questionId = this.context.questions[currentQuestionIndex].id;
      }
      
      // Calculate segment duration if possible
      if (i < processed.length - 1) {
        transcript.duration = processed[i + 1].timestamp - transcript.timestamp;
      }
    }
    
    return processed;
  }

  private getInterviewDuration(): number {
    if (this.transcripts.length === 0) return 0;
    
    const startTime = this.transcripts[0].timestamp;
    const endTime = this.transcripts[this.transcripts.length - 1].timestamp;
    return Math.floor((endTime - startTime) / 1000 / 60); // Duration in minutes
  }

  // Getters for current state
  isActive(): boolean {
    return this.isCallActive;
  }

  getCurrentTranscripts(): VapiTranscript[] {
    return [...this.transcripts];
  }

  getCurrentContext(): InterviewContext | null {
    return this.context;
  }

  // Utility methods
  getTranscriptText(): string {
    return this.transcripts
      .map(t => `${t.speaker}: ${t.text}`)
      .join('\n');
  }

  getCandidateResponses(): VapiTranscript[] {
    return this.transcripts.filter(t => t.speaker === 'user');
  }

  getInterviewerQuestions(): VapiTranscript[] {
    return this.transcripts.filter(t => t.speaker === 'assistant');
  }
}

// Singleton instance
export const vapiService = new VapiService();
