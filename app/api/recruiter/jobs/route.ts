import { NextResponse } from 'next/server';
import { requireRecruiter } from '@/lib/clerk';
import { recruiterService } from '@/lib/recruiter-service';
import { db } from '@/lib/db';
import { jobDescriptions } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const userWithRole = await requireRecruiter();
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Get jobs posted by this recruiter
    const jobs = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.postedById, userWithRole.id))
      .orderBy(desc(jobDescriptions.createdAt))
      .limit(limit);

    return NextResponse.json({ 
      success: true, 
      jobs 
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch jobs' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userWithRole = await requireRecruiter();
    const jobData = await request.json();

    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.description) {
      return NextResponse.json({ 
        error: 'Title, company, and description are required' 
      }, { status: 400 });
    }

    // Create job posting
    const jobId = await recruiterService.createJobPosting(userWithRole.id, {
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      location: jobData.location,
      salaryRange: jobData.salaryRange,
      jobType: jobData.jobType || 'full-time',
      experienceLevel: jobData.experienceLevel || 'intermediate',
      isRemote: jobData.isRemote || false,
      estimatedTime: jobData.estimatedTime || 30,
      questionsCount: jobData.questionsCount || 5
    });

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Job posting created successfully' 
    });
  } catch (error) {
    console.error('Error creating job posting:', error);
    return NextResponse.json({ 
      error: 'Failed to create job posting' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const userWithRole = await requireRecruiter();
    const { jobId, isActive } = await request.json();

    if (!jobId || typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        error: 'Job ID and active status are required' 
      }, { status: 400 });
    }

    const success = await recruiterService.updateJobStatus(
      jobId, 
      userWithRole.id, 
      isActive
    );

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to update job status' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Job status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json({ 
      error: 'Failed to update job status' 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userWithRole = await requireRecruiter();
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ 
        error: 'Job ID is required' 
      }, { status: 400 });
    }

    const success = await recruiterService.deleteJob(jobId, userWithRole.id);

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to delete job' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Job deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ 
      error: 'Failed to delete job' 
    }, { status: 500 });
  }
}
