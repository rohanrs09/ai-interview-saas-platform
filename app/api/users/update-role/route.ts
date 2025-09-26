import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setInitialUserRole, updateUserRole } from '@/lib/clerk';
import type { UserRole } from '@/lib/clerk';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { role } = await request.json() as { role: UserRole };
    
    // Validate role
    if (role !== 'candidate' && role !== 'recruiter') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Update user role in both Clerk and our database
    await setInitialUserRole(userId, role);

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}