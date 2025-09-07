# Supabase Setup Guide

This guide will help you set up Supabase for the AI Mock Interview platform.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `ai-interview-platform`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click "Create new project"

## 2. Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

3. Go to **Settings** → **Database**
4. Copy the **Connection string** (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres`)

## 3. Update Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# Clerk Authentication (keep existing)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Other existing variables...
```

## 4. Set Up Database Schema

Run the following commands to create your database tables:

```bash
# Generate migrations
npm run db:generate

# Push schema to Supabase
npm run db:push
```

## 5. Verify Setup

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. You should see all the tables created:
   - `users`
   - `candidate_profiles`
   - `job_descriptions`
   - `interview_sessions`
   - `interview_questions`
   - `feedback_reports`
   - `subscriptions`
   - `proctoring_logs`

## 6. Optional: Enable Row Level Security

For better security, you can enable Row Level Security (RLS) on your tables:

1. Go to **Authentication** → **Policies**
2. Create policies for each table to control access
3. This ensures users can only access their own data

## 7. Test the Connection

Start your development server:

```bash
npm run dev
```

Visit `http://localhost:3000` and test the sign-up/sign-in flow to ensure everything is working.

## Benefits of Using Supabase

- **No Database Management**: Supabase handles all PostgreSQL management
- **Real-time Features**: Built-in real-time subscriptions for live updates
- **File Storage**: Store resumes and interview recordings
- **Edge Functions**: Serverless functions for AI processing
- **Built-in Auth**: Optional replacement for Clerk
- **Dashboard**: Easy database management and monitoring

## Troubleshooting

### Connection Issues
- Double-check your `DATABASE_URL` format
- Ensure your password doesn't contain special characters that need URL encoding
- Verify your project is not paused (check Supabase dashboard)

### Migration Issues
- Make sure you're using the correct database URL
- Check that your Supabase project is active
- Verify your database password is correct

### API Issues
- Ensure your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check that your Supabase project is not paused
- Verify the anon key is from the correct project

## Next Steps

Once Supabase is set up, you can:
1. Use real-time features for live interview monitoring
2. Store files (resumes, recordings) in Supabase Storage
3. Create Edge Functions for AI processing
4. Optionally replace Clerk with Supabase Auth
5. Set up database backups and monitoring
