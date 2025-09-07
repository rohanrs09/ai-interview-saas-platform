import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
}

export async function requireRole(role: 'candidate' | 'recruiter') {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // In a real app, you'd fetch the user's role from the database
  // For now, we'll use Clerk's metadata
  const { sessionClaims } = await auth();
  const userRole = sessionClaims?.metadata?.role as string;

  if (userRole !== role) {
    redirect('/dashboard');
  }

  return userId;
}
