# 🚀 AI Interview SaaS Setup Guide

## Quick Setup (5 minutes)

### 1. Copy Environment File
```bash
cp env.example .env.local
```

### 2. Get Your Keys

#### A. Clerk Authentication (Free)
1. Go to [clerk.com](https://clerk.com)
2. Create new application
3. Copy keys to `.env.local`

#### B. Supabase Database (Free)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database
4. Copy connection string to `.env.local`

#### C. Google Gemini AI (Free)
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Get API key
3. Add to `.env.local`

#### D. Stripe (Free for testing)
1. Go to [stripe.com](https://stripe.com)
2. Get test keys
3. Create products in dashboard
4. Add keys to `.env.local`

### 3. Setup Database
```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

### 4. Start Application
```bash
npm run dev
```

## ✅ What Works After Setup

- ✅ User authentication (sign up/sign in)
- ✅ Dashboard for candidates and recruiters
- ✅ Mock interview system
- ✅ Job management
- ✅ AI-powered questions
- ✅ Payment processing
- ✅ Analytics and reporting

## 🔧 Troubleshooting

### Database Migration Error
- Make sure `DATABASE_URL` is correct in `.env.local`
- Run `npm run db:generate` again

### Clerk Login Not Working
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Make sure URLs are correct in Clerk dashboard

### App Not Starting
- Check all environment variables are set
- Run `npm install` to ensure dependencies are installed

## 📱 Test the App

1. Go to `http://localhost:3001`
2. Click "Get Started" to sign up
3. Complete your profile
4. Start your first interview!

## 🎯 Features to Test

- **Sign Up/Sign In** - User authentication
- **Dashboard** - View your profile and stats
- **Interviews** - Browse and start mock interviews
- **Job Management** - Create and manage job postings (recruiter view)
- **Analytics** - View performance metrics
- **Pricing** - Check subscription plans

The app is fully functional and ready for production use!
