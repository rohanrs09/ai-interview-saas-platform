import { NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentUserWithRole } from '@/lib/clerk'
import { db } from '@/lib/db'
import { jobDescriptions, interviewQuestions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
// import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize AI providers
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null

// Schema for question generation request
const questionGenerationSchema = z.object({
  jobDescriptionId: z.string().uuid('Invalid job description ID')
})

// POST handler - Generate interview questions based on job description
export async function POST(request: Request) {
  try {
    // Authenticate and verify user is a recruiter
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (role !== 'recruiter') {
      return NextResponse.json({ error: 'Access denied. Recruiter role required.' }, { status: 403 })
    }
    
    // Parse and validate request body
    const body = await request.json()
    const { jobDescriptionId } = questionGenerationSchema.parse(body)
    
    // Fetch the job description
    const jobDescription = await db.select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, jobDescriptionId))
      .limit(1)
    
    if (!jobDescription || jobDescription.length === 0) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 })
    }
    
    // Verify the job description belongs to this recruiter
    if (jobDescription[0].createdBy !== user.id) {
      return NextResponse.json({ error: 'Access denied to this job description' }, { status: 403 })
    }
    
    // Generate questions using AI
    const questions = await generateQuestionsFromJobDescription(jobDescription[0])
    
    // Save questions to database
    const questionsToInsert = questions.map(q => ({
      id: uuidv4(),
      jobDescriptionId,
      question: q.question,
      skillTag: q.skillTag,
      difficulty: q.difficulty,
      type: q.type,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    
    if (questionsToInsert.length > 0) {
      await db.insert(interviewQuestions).values(questionsToInsert)
      
      // Update job description with question count
      await db.update(jobDescriptions)
        .set({ 
          questionCount: questionsToInsert.length,
          updatedAt: new Date()
        })
        .where(eq(jobDescriptions.id, jobDescriptionId))
    }
    
    return NextResponse.json({ 
      message: 'Questions generated successfully',
      questions: questionsToInsert
    })
  } catch (error) {
    console.error('Error generating questions:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 })
  }
}

async function generateQuestionsFromJobDescription(jobDesc: any) {
  // If no AI providers are available, generate mock questions
  if (!openai && !genAI) {
    return generateMockQuestions(jobDesc)
  }
  
  try {
    const prompt = `
      You are an expert technical interviewer. Generate 10 interview questions based on this job description:
      
      Title: ${jobDesc.title}
      Company: ${jobDesc.company || 'Not specified'}
      Department: ${jobDesc.department || 'Not specified'}
      Experience Level: ${jobDesc.experienceLevel}
      
      Job Description:
      ${jobDesc.description}
      
      Generate a mix of technical and behavioral questions that would help assess a candidate for this role.
      For each question, include:
      1. The question text
      2. A skill tag (e.g., "JavaScript", "System Design", "Problem Solving", "Communication")
      3. Difficulty level ("easy", "medium", "hard")
      4. Question type ("technical" or "behavioral")
      
      Return the questions in JSON format like this:
      [
        {
          "question": "Question text here",
          "skillTag": "Skill name",
          "difficulty": "easy|medium|hard",
          "type": "technical|behavioral"
        },
        ...
      ]
      
      Return ONLY the JSON array with no additional text.
    `
    
    let questionsData
    
    // Try OpenAI first if available
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
      
      const content = completion.choices[0].message.content
      if (content) {
        const parsedContent = JSON.parse(content)
        if (Array.isArray(parsedContent.questions || parsedContent)) {
          questionsData = parsedContent.questions || parsedContent
        }
      }
    }
    
    // If OpenAI failed or isn't available, try Gemini
    if (!questionsData && genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0])
      }
    }
    
    // If we have questions data, return it
    if (questionsData && Array.isArray(questionsData)) {
      return questionsData.slice(0, 15) // Limit to 15 questions max
    }
    
    // Fallback to mock questions if AI generation failed
    return generateMockQuestions(jobDesc)
  } catch (error) {
    console.error('Error in AI question generation:', error)
    return generateMockQuestions(jobDesc)
  }
}

function generateMockQuestions(jobDesc: any) {
  // Extract potential skills from job description
  const description = jobDesc.description.toLowerCase()
  
  const skillKeywords = {
    'javascript': description.includes('javascript') || description.includes('js'),
    'react': description.includes('react'),
    'node': description.includes('node') || description.includes('nodejs'),
    'python': description.includes('python'),
    'java': description.includes('java') && !description.includes('javascript'),
    'sql': description.includes('sql') || description.includes('database'),
    'system design': description.includes('design') || description.includes('architecture'),
    'problem solving': true, // Always include problem solving
    'communication': true, // Always include communication
    'teamwork': description.includes('team') || description.includes('collaborate'),
    'leadership': description.includes('lead') || description.includes('leadership'),
    'cloud': description.includes('cloud') || description.includes('aws') || description.includes('azure'),
    'devops': description.includes('devops') || description.includes('ci/cd'),
    'mobile': description.includes('mobile') || description.includes('ios') || description.includes('android'),
    'frontend': description.includes('frontend') || description.includes('front-end') || description.includes('ui'),
    'backend': description.includes('backend') || description.includes('back-end') || description.includes('api'),
  }
  
  // Get skills that are mentioned in the job description
  const relevantSkills = Object.keys(skillKeywords).filter(skill => skillKeywords[skill as keyof typeof skillKeywords])
  
  // Technical questions based on experience level
  const technicalQuestions = [
    {
      question: "Explain the concept of closures in JavaScript and provide a practical example.",
      skillTag: "JavaScript",
      difficulty: jobDesc.experienceLevel === 'entry' ? "medium" : "easy",
      type: "technical"
    },
    {
      question: "How would you optimize the performance of a React application?",
      skillTag: "React",
      difficulty: jobDesc.experienceLevel === 'entry' ? "hard" : "medium",
      type: "technical"
    },
    {
      question: "Describe the differences between relational and NoSQL databases, and when you would choose one over the other.",
      skillTag: "Databases",
      difficulty: "medium",
      type: "technical"
    },
    {
      question: "How would you design a scalable API for a social media platform?",
      skillTag: "System Design",
      difficulty: jobDesc.experienceLevel === 'senior' ? "medium" : "hard",
      type: "technical"
    },
    {
      question: "Explain how you would implement authentication and authorization in a web application.",
      skillTag: "Security",
      difficulty: "medium",
      type: "technical"
    },
    {
      question: "How would you approach debugging a memory leak in a production application?",
      skillTag: "Debugging",
      difficulty: jobDesc.experienceLevel === 'entry' ? "hard" : "medium",
      type: "technical"
    }
  ]
  
  // Behavioral questions
  const behavioralQuestions = [
    {
      question: "Describe a challenging project you worked on and how you overcame obstacles.",
      skillTag: "Problem Solving",
      difficulty: "medium",
      type: "behavioral"
    },
    {
      question: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      skillTag: "Teamwork",
      difficulty: "medium",
      type: "behavioral"
    },
    {
      question: "How do you prioritize tasks when you have multiple deadlines approaching?",
      skillTag: "Time Management",
      difficulty: "medium",
      type: "behavioral"
    },
    {
      question: "Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder.",
      skillTag: "Communication",
      difficulty: "medium",
      type: "behavioral"
    }
  ]
  
  // Combine questions and shuffle
  const allQuestions = [...technicalQuestions, ...behavioralQuestions]
  
  // Shuffle array
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
  }
  
  // Return 10 questions
  return allQuestions.slice(0, 10)
}