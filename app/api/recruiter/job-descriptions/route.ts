import { NextResponse } from 'next/server'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentUserWithRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { jobDescriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'

// Schema for job description creation/update
const jobDescriptionSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(1, 'Job description is required'),
  experienceLevel: z.enum(['entry', 'mid', 'senior']),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
})

// GET handler - Fetch all job descriptions for the recruiter
export async function GET() {
  try {
    // Authenticate and verify user is a recruiter
    const { user, role } = await getCurrentUserWithRole()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (role !== 'recruiter') {
      return NextResponse.json({ error: 'Access denied. Recruiter role required.' }, { status: 403 })
    }
    
    // Fetch job descriptions created by this recruiter
    const results = await db.select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.createdBy, user.id))
      .orderBy(jobDescriptions.createdAt.desc())
    
    return NextResponse.json({ jobDescriptions: results })
  } catch (error) {
    console.error('Error fetching job descriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch job descriptions' }, { status: 500 })
  }
}

// POST handler - Create a new job description
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
    const validatedData = jobDescriptionSchema.parse(body)
    
    // Extract skills from description using simple keyword matching
    // In a production app, this would use more sophisticated NLP
    const commonSkills = [
      'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express', 
      'python', 'django', 'flask', 'java', 'spring', 'c#', '.net', 'php', 'laravel',
      'ruby', 'rails', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'react native',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
      'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
      'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material ui',
      'git', 'agile', 'scrum', 'jira', 'figma', 'sketch', 'adobe xd'
    ]
    
    const skills = commonSkills.filter(skill => 
      validatedData.description.toLowerCase().includes(skill)
    )
    
    // Create new job description
    const newJobDescription = {
      id: uuidv4(),
      ...validatedData,
      skills,
      requirements: [], // Could be extracted with more sophisticated NLP
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    // Insert into database
    await db.insert(jobDescriptions).values(newJobDescription)
    
    return NextResponse.json({ 
      message: 'Job description created successfully',
      jobDescription: newJobDescription
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating job description:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create job description' }, { status: 500 })
  }
}