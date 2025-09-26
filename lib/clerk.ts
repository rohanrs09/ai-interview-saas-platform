import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from './db';
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm';

export type UserRole = 'candidate' | 'recruiter';

export async function getCurrentUser() {
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUserWithRole() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // First check if user exists in our database
  const dbUser = await db.select().from(users).where(eq(users.clerkId, clerkUser.id)).limit(1);
  
  if (dbUser.length === 0) {
    // User doesn't exist in DB, create them
    const role = determineUserRole(clerkUser);
    
    // Set role in Clerk metadata if not already set
    if (!clerkUser.publicMetadata?.role) {
      await clerkClient.users.updateUser(clerkUser.id, {
        publicMetadata: { ...clerkUser.publicMetadata, role }
      });
    }
    
    const newUser = await db.insert(users).values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      role: role,
    }).returning();
    
    return { ...newUser[0], clerkUser };
  }
  
  // Ensure Clerk metadata is in sync with our database
  if (clerkUser.publicMetadata?.role !== dbUser[0].role) {
    await clerkClient.users.updateUser(clerkUser.id, {
      publicMetadata: { ...clerkUser.publicMetadata, role: dbUser[0].role }
    });
  }

  return { ...dbUser[0], clerkUser };
}

function determineUserRole(clerkUser: any): UserRole {
  // Check Clerk metadata first
  if (clerkUser.publicMetadata?.role) {
    return clerkUser.publicMetadata.role as UserRole;
  }
  
  // Check email patterns for role determination
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const recruiterPatterns = [
    '@hr.', '@talent.', '@recruiting.', '@people.',
    'recruiter', 'talent', 'hiring', 'hr-'
  ];
  
  const isRecruiter = recruiterPatterns.some(pattern => 
    email.toLowerCase().includes(pattern.toLowerCase())
  );
  
  return isRecruiter ? 'recruiter' : 'candidate';
}

export async function requireAuth() {
  const userId = await getCurrentUser();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
}

export async function requireRole(requiredRole: UserRole) {
  const userWithRole = await getCurrentUserWithRole();
  
  if (!userWithRole) {
    redirect('/sign-in');
  }

  if (userWithRole.role !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    redirect(userWithRole.role === 'candidate' ? '/dashboard' : '/dashboard/recruiter');
  }

  return userWithRole;
}

export async function requireCandidate() {
  return requireRole('candidate');
}

export async function requireRecruiter() {
  return requireRole('recruiter');
}

export async function getUserRole(): Promise<UserRole | null> {
  try {
    const userWithRole = await getCurrentUserWithRole();
    return userWithRole?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function setInitialUserRole(userId: string, role: UserRole): Promise<void> {
  // Update both Clerk metadata and our database
  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role }
  });
  
  // Check if user exists in our database
  const dbUser = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  
  if (dbUser.length === 0) {
    // Get user from Clerk to create in our database
    const clerkUser = await clerkClient.users.getUser(userId);
    
    await db.insert(users).values({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      role: role,
    });
  } else {
    // Update existing user
    await db.update(users).set({ role }).where(eq(users.clerkId, userId));
  }
}

export async function updateUserRole(clerkId: string, role: UserRole) {
  // Update role in our database
  await db.update(users).set({ role }).where(eq(users.clerkId, clerkId));
  
  // Update role in Clerk metadata
  await clerkClient.users.updateUser(clerkId, {
    publicMetadata: { role }
  });
}
