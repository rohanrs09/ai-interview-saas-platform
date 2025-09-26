import { NextResponse } from 'next/server';
import { requireRecruiter } from '@/lib/clerk';
import { recruiterService } from '@/lib/recruiter-service';

export async function GET(request: Request) {
  try {
    const userWithRole = await requireRecruiter();
    const url = new URL(request.url);
    
    const jobId = url.searchParams.get('jobId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const analyticsOnly = url.searchParams.get('analytics') === 'true';

    if (analyticsOnly) {
      // Return analytics data
      const analytics = await recruiterService.getJobAnalytics(
        userWithRole.id, 
        jobId || undefined
      );

      if (!analytics) {
        return NextResponse.json({ 
          error: 'Failed to fetch analytics' 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        analytics 
      });
    } else {
      // Return candidate reports
      const reports = await recruiterService.getCandidateReports(
        userWithRole.id,
        jobId || undefined,
        limit
      );

      return NextResponse.json({ 
        success: true, 
        candidates: reports,
        total: reports.length
      });
    }
  } catch (error) {
    console.error('Error fetching candidate data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch candidate data' 
    }, { status: 500 });
  }
}
