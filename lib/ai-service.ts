import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI (will use mock data if API key not available)
const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null

export interface QuestionGenerationParams {
  jobTitle: string
  jobDescription?: string
  skills?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  count?: number
  resumeText?: string
}

export async function generateInterviewQuestions(params: QuestionGenerationParams) {
  const { jobTitle, jobDescription, skills = [], difficulty, count = 5, resumeText } = params

  // If no API key, return mock questions
  if (!genAI) {
    return generateMockQuestions(params)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
      Generate ${count} interview questions for a ${jobTitle} position.
      
      Job Description: ${jobDescription || 'General technical role'}
      Required Skills: ${skills.join(', ') || 'General technical skills'}
      Difficulty Level: ${difficulty}
      ${resumeText ? `Candidate Resume: ${resumeText}` : ''}
      
      Generate a mix of behavioral, technical, and situational questions.
      Return the response as a JSON array with the following structure:
      [
        {
          "questionText": "question text",
          "type": "behavioral" | "technical" | "situational",
          "difficulty": "beginner" | "intermediate" | "advanced",
          "skillTag": "relevant skill",
          "expectedAnswer": "brief guide for expected answer",
          "timeLimit": time in seconds (60-300)
        }
      ]
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0])
      return questions
    }
    
    // Fallback to mock if parsing fails
    return generateMockQuestions(params)
  } catch (error) {
    console.error('Error generating questions with Gemini:', error)
    return generateMockQuestions(params)
  }
}

function generateMockQuestions(params: QuestionGenerationParams) {
  const { jobTitle, difficulty, count = 5 } = params
  
  const behavioralQuestions = [
    {
      questionText: `Tell me about yourself and your experience relevant to the ${jobTitle} position.`,
      type: 'behavioral',
      difficulty: 'beginner',
      skillTag: 'communication',
      expectedAnswer: 'Clear, concise professional summary highlighting relevant experience',
      timeLimit: 180
    },
    {
      questionText: 'Describe a challenging project you worked on and how you overcame obstacles.',
      type: 'behavioral',
      difficulty: 'intermediate',
      skillTag: 'problem-solving',
      expectedAnswer: 'STAR method response with specific examples',
      timeLimit: 240
    },
    {
      questionText: 'How do you handle disagreements with team members?',
      type: 'behavioral',
      difficulty: 'intermediate',
      skillTag: 'teamwork',
      expectedAnswer: 'Demonstrates conflict resolution and communication skills',
      timeLimit: 180
    }
  ]

  const technicalQuestions = [
    {
      questionText: 'Explain your approach to debugging complex issues in production.',
      type: 'technical',
      difficulty: 'advanced',
      skillTag: 'debugging',
      expectedAnswer: 'Systematic approach with tools and methodologies',
      timeLimit: 240
    },
    {
      questionText: 'What are the key principles of clean code and how do you apply them?',
      type: 'technical',
      difficulty: 'intermediate',
      skillTag: 'best-practices',
      expectedAnswer: 'SOLID principles, DRY, readability, maintainability',
      timeLimit: 180
    },
    {
      questionText: 'How would you optimize a slow-performing database query?',
      type: 'technical',
      difficulty: 'advanced',
      skillTag: 'database',
      expectedAnswer: 'Indexing, query optimization, caching strategies',
      timeLimit: 240
    }
  ]

  const situationalQuestions = [
    {
      questionText: 'You discover a critical bug in production just before a major release. What do you do?',
      type: 'situational',
      difficulty: 'advanced',
      skillTag: 'decision-making',
      expectedAnswer: 'Risk assessment, communication, rollback strategies',
      timeLimit: 180
    },
    {
      questionText: 'How would you handle a situation where you need to learn a new technology quickly for a project?',
      type: 'situational',
      difficulty: 'intermediate',
      skillTag: 'learning-agility',
      expectedAnswer: 'Learning strategies, resource utilization, time management',
      timeLimit: 180
    }
  ]

  // Combine and filter based on difficulty
  let allQuestions = [...behavioralQuestions, ...technicalQuestions, ...situationalQuestions]
  
  if (difficulty === 'beginner') {
    allQuestions = allQuestions.filter(q => q.difficulty !== 'advanced')
  } else if (difficulty === 'advanced') {
    allQuestions = allQuestions.filter(q => q.difficulty !== 'beginner')
  }

  // Return requested number of questions
  return allQuestions.slice(0, count)
}

// Extract skills from resume text using basic pattern matching
function extractSkillsFromText(text: string) {
  // Common technical skills to look for
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'HTML', 'CSS',
    'Git', 'Docker', 'AWS', 'Azure', 'GCP', 'REST', 'GraphQL', 'MongoDB', 'PostgreSQL',
    'Express', 'Next.js', 'Redux', 'Vue', 'Angular', 'Svelte', 'Django', 'Flask', 'Spring',
    'Machine Learning', 'Data Analysis', 'CI/CD', 'Kubernetes', 'Terraform', 'Jenkins',
    'Agile', 'Scrum', 'JIRA', 'Confluence', 'Figma', 'UI/UX', 'Responsive Design'
  ];

  // Extract years of experience using common patterns
  const experienceMatch = text.match(/(\d+\+?\s*(year|yr)s?\.?\s*\w*\s*experience)/i);
  const experience = experienceMatch ? experienceMatch[0] : '1+ years';

  // Find skills mentioned in the text
  const foundSkills = commonSkills.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );

  // If no skills found, use some defaults
  const skills = foundSkills.length > 0 ? foundSkills : [
    'Problem Solving',
    'Team Collaboration',
    'Communication'
  ];

  return {
    skills,
    experience,
    achievements: [
      'Successfully completed multiple projects',
      'Contributed to team success through collaboration'
    ],
    focusAreas: skills.slice(0, 3)
  };
}

export async function analyzeResume(resumeText: string) {
  // Input validation
  if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
    console.warn('Resume text is too short or invalid, using fallback extraction');
    return extractSkillsFromText(resumeText);
  }

  // If no API key, use the fallback extraction
  if (!genAI) {
    console.log('No Gemini API key found, using fallback resume analysis');
    return extractSkillsFromText(resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
      Analyze the following resume and extract the following information:
      1. Technical skills (as an array of strings)
      2. Years of experience (as a string like "X years")
      3. Key achievements (as an array of strings, max 3)
      4. Suggested interview focus areas (as an array of strings, max 3)
      
      Resume:
      ${resumeText.substring(0, 10000)}  // Limit input size to prevent token limits
      
      Return ONLY a valid JSON object with this exact structure:
      {
        "skills": ["skill1", "skill2"],
        "experience": "X years",
        "achievements": ["achievement1", "achievement2"],
        "focusAreas": ["area1", "area2"]
      }
    `;

    console.log('Sending request to Gemini API for resume analysis');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Received response from Gemini API:', text.substring(0, 200) + '...');
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate the response structure
        if (Array.isArray(parsed.skills) && parsed.experience) {
          return {
            skills: parsed.skills.slice(0, 10), // Limit to 10 skills
            experience: parsed.experience,
            achievements: Array.isArray(parsed.achievements) ? parsed.achievements.slice(0, 3) : [],
            focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas.slice(0, 3) : []
          };
        }
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
      }
    }
    
    console.log('Falling back to basic extraction due to invalid response format');
    return extractSkillsFromText(resumeText);
  } catch (error) {
    console.error('Error analyzing resume with Gemini:', error);
    return extractSkillsFromText(resumeText);
  }
}

export async function generateFeedback(question: string, answer: string, expectedAnswer?: string) {
  if (!genAI) {
    return generateMockFeedback(answer)
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
      Evaluate this interview answer:
      
      Question: ${question}
      Answer: ${answer}
      ${expectedAnswer ? `Expected points: ${expectedAnswer}` : ''}
      
      Provide constructive feedback including:
      1. Score (0-100)
      2. Strengths
      3. Areas for improvement
      4. Suggestions
      
      Return as JSON:
      {
        "score": number,
        "strengths": ["point1", "point2"],
        "improvements": ["point1", "point2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return generateMockFeedback(answer)
  } catch (error) {
    console.error('Error generating feedback:', error)
    return generateMockFeedback(answer)
  }
}

function generateMockFeedback(answer: string) {
  const wordCount = answer.split(' ').length
  const score = Math.min(100, 50 + Math.min(50, wordCount))
  
  return {
    score,
    strengths: [
      'Provided a response to the question',
      wordCount > 50 ? 'Detailed answer' : 'Concise answer'
    ],
    improvements: [
      wordCount < 50 ? 'Could provide more detail' : 'Consider being more concise',
      'Include specific examples'
    ],
    suggestions: [
      'Use the STAR method for behavioral questions',
      'Practice your delivery and timing'
    ]
  }
}
