import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export const aiService = {
  async extractSkillsFromResume(resumeText: string): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `Extract technical skills, programming languages, frameworks, tools, and relevant technologies from this resume. Return only a JSON array of skills, no other text:

Resume:
${resumeText}

Example format: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"]`
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      // Clean up the response and parse JSON
      const cleanText = text.replace(/```json|```/g, '').trim()
      const skills = JSON.parse(cleanText)
      
      return Array.isArray(skills) ? skills : []
    } catch (error) {
      console.error('Error extracting skills:', error)
      // Fallback: basic keyword extraction
      return this.fallbackSkillExtraction(resumeText)
    }
  },

  fallbackSkillExtraction(resumeText: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'GraphQL', 'REST', 'API', 'Microservices', 'DevOps', 'CI/CD'
    ]
    
    const foundSkills = commonSkills.filter(skill => 
      resumeText.toLowerCase().includes(skill.toLowerCase())
    )
    
    return foundSkills.slice(0, 10) // Limit to 10 skills
  },

  async generateInterviewQuestions(
    candidateSkills: string[], 
    jobDescription: string, 
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    count: number = 5
  ) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `Generate ${count} ${difficulty} level interview questions for a candidate with these skills: ${candidateSkills.join(', ')}

Job Description: ${jobDescription}

Requirements:
- Mix of technical and behavioral questions
- Questions should test both knowledge and problem-solving
- Include difficulty level and estimated time
- Return as JSON array with this structure:
[
  {
    "id": 1,
    "questionText": "question here",
    "type": "technical|behavioral|situational",
    "skillTag": "relevant skill",
    "difficulty": "${difficulty}",
    "timeLimit": 5,
    "expectedAnswer": "brief guidance for evaluation"
  }
]`
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      const cleanText = text.replace(/```json|```/g, '').trim()
      const questions = JSON.parse(cleanText)
      
      return Array.isArray(questions) ? questions : []
    } catch (error) {
      console.error('Error generating questions:', error)
      return this.fallbackQuestions(candidateSkills, difficulty)
    }
  },

  fallbackQuestions(skills: string[], difficulty: string) {
    const templates = [
      {
        id: 1,
        questionText: `Explain your experience with ${skills[0] || 'web development'} and how you've used it in projects.`,
        type: 'technical',
        skillTag: skills[0] || 'General',
        difficulty,
        timeLimit: 5,
        expectedAnswer: 'Should demonstrate practical experience and understanding'
      },
      {
        id: 2,
        questionText: 'Describe a challenging problem you solved and your approach to solving it.',
        type: 'behavioral',
        skillTag: 'Problem Solving',
        difficulty,
        timeLimit: 4,
        expectedAnswer: 'Should show analytical thinking and problem-solving process'
      }
    ]
    return templates
  },

  async evaluateAnswer(question: string, answer: string, skillTag: string, expectedAnswer?: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `Evaluate this interview answer comprehensively:

Question: ${question}
Skill being tested: ${skillTag}
Expected answer guidance: ${expectedAnswer || 'N/A'}

Candidate's Answer: ${answer}

Provide evaluation in this JSON format:
{
  "score": 85,
  "strengths": ["specific strength 1", "specific strength 2"],
  "weaknesses": ["area for improvement 1", "area for improvement 2"],
  "feedback": "detailed constructive feedback",
  "suggestions": ["specific suggestion 1", "specific suggestion 2"]
}

Score should be 0-100 based on:
- Technical accuracy (if applicable)
- Clarity of communication
- Depth of understanding
- Practical experience demonstrated`
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      const cleanText = text.replace(/```json|```/g, '').trim()
      const evaluation = JSON.parse(cleanText)
      
      return {
        score: evaluation.score || 50,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        feedback: evaluation.feedback || 'Answer provided.',
        suggestions: evaluation.suggestions || []
      }
    } catch (error) {
      console.error('Error evaluating answer:', error)
      return {
        score: 50,
        strengths: ['Answer provided'],
        weaknesses: ['Could provide more detail'],
        feedback: 'Thank you for your response.',
        suggestions: ['Consider providing more specific examples']
      }
    }
  },

  async generateFeedbackReport(sessionData: {
    questions: any[]
    answers: any[]
    scores: number[]
    candidateSkills: string[]
    jobTitle: string
  }) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const averageScore = sessionData.scores.reduce((a, b) => a + b, 0) / sessionData.scores.length
    
    const prompt = `Generate a comprehensive interview feedback report:

Job Title: ${sessionData.jobTitle}
Candidate Skills: ${sessionData.candidateSkills.join(', ')}
Average Score: ${averageScore.toFixed(1)}/100
Total Questions: ${sessionData.questions.length}

Question Performance:
${sessionData.questions.map((q, i) => 
  `Q${i+1}: ${q.questionText} (Score: ${sessionData.scores[i] || 0}/100)`
).join('\n')}

Generate a JSON report with:
{
  "overallScore": ${Math.round(averageScore)},
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "skillAssessment": {
    "skill1": 85,
    "skill2": 70
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "nextSteps": ["next step 1", "next step 2"]
}`
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      const cleanText = text.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanText)
    } catch (error) {
      console.error('Error generating feedback report:', error)
      return {
        overallScore: Math.round(averageScore),
        summary: 'Interview completed successfully.',
        strengths: ['Participated in the interview'],
        weaknesses: ['Could provide more detailed responses'],
        skillAssessment: {},
        recommendations: ['Continue practicing interview skills'],
        nextSteps: ['Review feedback and improve']
      }
    }
  }

}
