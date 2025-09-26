import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/clerk';
import type { UserRole } from '@/lib/clerk';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/features",
  "/faq",
  "/sign-in",
  "/sign-up",
  "/api/webhooks/stripe",
  "/api/jobs",
  "/api/analytics",
  "/api/candidates",
  "/api/stripe/create-checkout-session",
  "/api/stripe/create-portal-session",
]);

// Routes that require candidate role
const isCandidateRoute = createRouteMatcher([
  "/interviews",
  "/interviews/(.*)",
  "/dashboard/resume",
  "/dashboard/progress",
  "/api/interviews/create-session",
  "/api/interviews/save-transcript",
  "/api/interviews/analyze",
]);

// Routes that require recruiter role
const isRecruiterRoute = createRouteMatcher([
  "/dashboard/recruiter",
  "/dashboard/recruiter/(.*)",
  "/dashboard/jobs",
  "/dashboard/candidates",
  "/dashboard/analytics",
  "/api/recruiter/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect all other routes
  auth.protect();

  // Get the authenticated user from the auth object
  const { userId } = auth;
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  
  // Allow access to the dashboard page for all authenticated users
  if (req.nextUrl.pathname === '/dashboard') {
    return;
  }

  // Check role-specific routes
  if (isCandidateRoute(req) || isRecruiterRoute(req)) {
    try {
      // Get user role (this will create user in DB if needed and sync with Clerk metadata)
      const userRole = await getUserRole();
      
      if (!userRole) {
        // Redirect to dashboard for role assignment
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      // Check candidate routes
      if (isCandidateRoute(req) && userRole !== 'candidate') {
        return NextResponse.redirect(new URL('/dashboard/recruiter', req.url));
      }

      // Check recruiter routes
      if (isRecruiterRoute(req) && userRole !== 'recruiter') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      console.error('Error checking user role in middleware:', error);
      // Redirect to dashboard to handle role assignment
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};