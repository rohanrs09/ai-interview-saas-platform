# Deployment Guide

## Local Development Setup

### 1. Fix Clerk Configuration

1. **Get Clerk Keys:**
   - Visit: https://dashboard.clerk.com/apps/claim?token=5p374qva9ddbhmn1e4h7lu1avwzeqj8erwsixk77&return_url=http%3A%2F%2Flocalhost%3A3000%2F
   - Sign up/Login to Clerk
   - Copy your keys

2. **Create `.env.local` file:**
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-publishable-key-here"
CLERK_SECRET_KEY="sk_test_your-secret-key-here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Supabase Database
DATABASE_URL="postgresql://postgres:password@db.projectref.supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://projectref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Other APIs
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"
VAPI_API_KEY="your-vapi-api-key"
VAPI_PHONE_NUMBER_ID="your-phone-number-id"
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

3. **Start Development Server:**
```bash
npm run dev
```

## Vercel Deployment

### 1. Prepare for Deployment

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

### 2. Configure Environment Variables in Vercel

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_your-key
CLERK_SECRET_KEY = sk_test_your-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL = /dashboard
DATABASE_URL = postgresql://postgres:password@db.projectref.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL = https://projectref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
GOOGLE_GEMINI_API_KEY = your-gemini-api-key
VAPI_API_KEY = your-vapi-api-key
VAPI_PHONE_NUMBER_ID = your-phone-number-id
STRIPE_SECRET_KEY = sk_test_placeholder
STRIPE_WEBHOOK_SECRET = whsec_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_placeholder
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

### 3. Update Clerk URLs for Production

1. **In Clerk Dashboard:**
   - Go to your app settings
   - Update "Allowed redirect URLs" to include:
     - `https://your-app.vercel.app/dashboard`
     - `https://your-app.vercel.app/sign-in`
     - `https://your-app.vercel.app/sign-up`

2. **Update Environment Variables:**
   - Change `NEXT_PUBLIC_APP_URL` to your Vercel URL
   - Update Clerk URLs to use your production domain

### 4. Deploy Database Schema

1. **Set up Supabase:**
   - Create project at [supabase.com](https://supabase.com)
   - Get database URL and API keys
   - Update environment variables

2. **Run Migrations:**
```bash
npm run db:push
```

### 5. Test Deployment

1. **Check Authentication:**
   - Visit your Vercel URL
   - Test sign-up/sign-in flow
   - Verify redirects work

2. **Check Database:**
   - Test creating user profiles
   - Verify data persistence

## Troubleshooting

### Clerk Issues
- **Keyless Mode**: Check environment variable names are exact
- **Redirect Issues**: Verify URLs in Clerk dashboard match your domain
- **CORS Issues**: Check allowed origins in Clerk settings

### Database Issues
- **Connection Failed**: Verify DATABASE_URL format
- **Migration Failed**: Check Supabase project is active
- **Permission Denied**: Verify database password is correct

### Build Issues
- **TypeScript Errors**: Run `npm run build` locally first
- **Missing Dependencies**: Check package.json
- **Environment Variables**: Verify all required vars are set

## Production Checklist

- [ ] Clerk keys configured
- [ ] Supabase database set up
- [ ] Environment variables set in Vercel
- [ ] Database schema migrated
- [ ] Clerk URLs updated for production
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] All features tested in production
