import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async extractSkillsFromResume(resumeText: string): Promise<string[]> {
    const prompt = `
    Extract technical skills and competencies from the following resume text. 
    Return only a JSON array of skill names, no other text.
    
    Resume text:
    ${resumeText}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse as JSON array
      const skills = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return Array.isArray(skills) ? skills : [];
    } catch (error) {
      console.error('Error extracting skills:', error);
      return [];
    }
  }

  async extractSkillsFromJobDescription(jobDescription: string): Promise<string[]> {
    const prompt = `
    Extract required technical skills and competencies from the following job description. 
    Return only a JSON array of skill names, no other text.
    
    Job description:
    ${jobDescription}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const skills = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return Array.isArray(skills) ? skills : [];
    } catch (error) {
      console.error('Error extracting job skills:', error);
      return [];
    }
  }

  async generateInterviewQuestions(skillGaps: string[], jobTitle: string): Promise<Array<{ skill: string; question: string }>> {
    const prompt = `
    Generate 2-3 interview questions for each of the following skill gaps for a ${jobTitle} position.
    Return a JSON array of objects with "skill" and "question" properties.
    
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
}

export const aiService = new AIService();
