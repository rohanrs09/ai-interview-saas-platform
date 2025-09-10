import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export const aiService = {
  async extractSkillsFromResume(resumeText: string): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Extract technical skills, programming languages, frameworks, tools, and relevant technologies from this resume. Return only a JSON array of skills, no other text:

Resume:
${resumeText}

Example format: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"]`;
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean up the response and parse JSON
      const cleanText = text.replace(/```json|```/g, '').trim();
      const skills = JSON.parse(cleanText);
      
      return Array.isArray(skills) ? skills : [];
    } catch (error) {
      console.error('Error extracting skills:', error);
      // Fallback: basic keyword extraction
      return this.fallbackSkillExtraction(resumeText);
    }
  },

  fallbackSkillExtraction(resumeText: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'GraphQL', 'REST', 'API', 'Microservices', 'DevOps', 'CI/CD'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    );
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
  }>> {
    const prompt = `
    Generate 2-3 interview questions for each of the following skill gaps for a ${jobTitle} position.
    Include a mix of technical, behavioral, and situational questions.
    Return a JSON array of objects with the following structure:
    {
      "id": "unique_id",
      "skill": "skill_name",
      "question": "question_text",
      "type": "technical|behavioral|situational",
      "difficulty": "easy|medium|hard",
      "timeLimit": 5
    }
    
    Skill gaps: ${skillGaps.join(', ')}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const questions = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  async analyzeInterviewPerformance(
    questions: Array<{ skill: string; question: string; answer: string }>,
    jobTitle: string
  ): Promise<{
    summary: string;
    strengths: string;
    weaknesses: string;
    ratedSkills: Record<string, number>;
    overallScore: number;
    recommendations: string;
  }> {
    const prompt = `
    Analyze the following interview performance for a ${jobTitle} position.
    
    Questions and Answers:
    ${questions.map((q, i) => `${i + 1}. Skill: ${q.skill}\nQuestion: ${q.question}\nAnswer: ${q.answer}\n`).join('\n')}
    
    Return a JSON object with the following structure:
    {
      "summary": "Brief overall assessment",
      "strengths": "List of strengths demonstrated",
      "weaknesses": "Areas for improvement",
      "ratedSkills": {"skill1": score1, "skill2": score2, ...},
      "overallScore": 85,
      "recommendations": "Specific recommendations for improvement"
    }
    
    Rate each skill from 1-100 based on the answer quality.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return analysis;
    } catch (error) {
      console.error('Error analyzing performance:', error);
      return {
        summary: 'Unable to analyze performance at this time.',
        strengths: 'Analysis unavailable',
        weaknesses: 'Analysis unavailable',
        ratedSkills: {},
        overallScore: 0,
        recommendations: 'Please try again later.'
      };
    }
  }

  async generateJobDescription(
    title: string,
    company: string,
    requirements: string[],
    experience: string
  ): Promise<string> {
    const prompt = `
    Generate a comprehensive job description for a ${title} position at ${company}.
    
    Requirements: ${requirements.join(', ')}
    Experience Level: ${experience}
    
    Include:
    - Company overview
    - Role responsibilities
    - Required skills and qualifications
    - Preferred qualifications
    - Benefits and perks
    - Application instructions
    
    Make it professional and engaging.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating job description:', error);
      return 'Unable to generate job description at this time.';
    }
  }

  async analyzeResume(resumeText: string): Promise<{
    skills: string[];
    experience: string;
    education: string;
    summary: string;
    strengths: string[];
    improvements: string[];
  }> {
    const prompt = `
    Analyze the following resume and extract key information.
    Return a JSON object with:
    {
      "skills": ["skill1", "skill2", ...],
      "experience": "years of experience",
      "education": "education summary",
      "summary": "brief professional summary",
      "strengths": ["strength1", "strength2", ...],
      "improvements": ["improvement1", "improvement2", ...]
    }
    
    Resume text:
    ${resumeText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return analysis;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return {
        skills: [],
        experience: 'Unknown',
        education: 'Unknown',
        summary: 'Unable to analyze resume at this time.',
        strengths: [],
        improvements: []
      };
    }
  }

  async generateFeedback(
    question: string,
    answer: string,
    skill: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    const prompt = `
    Evaluate the following interview answer and provide detailed feedback.
    
    Question: ${question}
    Answer: ${answer}
    Skill Area: ${skill}
    
    Return a JSON object with:
    {
      "score": 85,
      "feedback": "detailed feedback on the answer",
      "suggestions": ["suggestion1", "suggestion2", ...]
    }
    
    Score should be 0-100 based on:
    - Technical accuracy
    - Clarity of explanation
    - Problem-solving approach
    - Communication skills
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const feedback = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return feedback;
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        score: 0,
        feedback: 'Unable to generate feedback at this time.',
        suggestions: []
      };
    }
  }

  async detectAnomalies(
    videoData: any,
    audioData: any,
    context: string
  ): Promise<{
    anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      timestamp: number;
    }>;
    riskScore: number;
  }> {
    // This would integrate with actual proctoring services
    // For now, return mock data
    return {
      anomalies: [],
      riskScore: 0
    };
  }
}

export const aiService = new AIService();
