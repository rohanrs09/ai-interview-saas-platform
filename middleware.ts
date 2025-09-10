// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/features",
  "/faq",
  "/api/webhooks/stripe",
  "/api/jobs",
  "/api/analytics",
  "/api/candidates",
  "/api/stripe/create-checkout-session",
  "/api/stripe/create-portal-session",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};