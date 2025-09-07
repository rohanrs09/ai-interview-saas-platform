# AI Mock Interview SaaS Platform

A comprehensive full-stack SaaS platform for AI-driven mock interviews, combining resume analysis, skill gap identification, and personalized interview questions with real-time feedback and analytics.

## Features

### For Candidates
- **Resume Upload & Analysis**: Upload your resume and get AI-powered skill extraction
- **Skill Gap Analysis**: Compare your skills against job requirements
- **AI-Generated Questions**: Get personalized interview questions based on skill gaps
- **Voice Interviews**: Practice with voice-based interviews using Vapi.ai
- **Real-time Proctoring**: Ensure interview integrity with video/audio monitoring
- **Detailed Feedback**: Receive comprehensive AI-generated feedback reports
- **Progress Tracking**: Monitor your improvement over time

### For Recruiters
- **Job Posting Management**: Create and manage job descriptions
- **Candidate Analytics**: View candidate performance and analytics
- **Interview Scheduling**: Schedule and manage interview sessions
- **Team Management**: Manage multiple recruiters and candidates
- **Custom Questions**: Create custom interview questions
- **API Access**: Integrate with existing HR systems

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **AI Services**: Google Gemini AI, Vapi.ai
- **Payments**: Stripe
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account (replaces PostgreSQL)
- Clerk account
- Stripe account
- Google Gemini API key
- Vapi.ai account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-interview
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google Gemini AI
GOOGLE_GEMINI_API_KEY="your_gemini_api_key"

# Vapi AI
VAPI_API_KEY="your_vapi_api_key"
VAPI_PHONE_NUMBER_ID="your_phone_number_id"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your database URL and API keys from the project settings
   - Update your `.env.local` with the Supabase credentials

6. Set up the database:
```bash
# Generate migrations
npm run db:generate

# Push schema to Supabase database
npm run db:push
```

7. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with role-based access (candidate/recruiter)
- **CandidateProfiles**: Resume data and extracted skills
- **JobDescriptions**: Job postings with required skills
- **InterviewSessions**: Interview instances with status and scores
- **InterviewQuestions**: Questions generated for each session
- **FeedbackReports**: AI-generated feedback and analysis
- **Subscriptions**: Stripe subscription management
- **ProctoringLogs**: Video/audio monitoring data

## API Endpoints

### Authentication
- Handled by Clerk middleware

### Resume Management
- `POST /api/resume/upload` - Upload and analyze resume

### Skills
- `POST /api/skills/match` - Match candidate skills with job requirements

### Interviews
- `POST /api/interviews` - Create new interview session
- `GET /api/interviews` - Get user's interview sessions
- `POST /api/interviews/[id]/answer` - Submit interview answer
- `POST /api/interviews/[id]/complete` - Complete interview and generate feedback
- `GET /api/interviews/[id]/feedback` - Get interview feedback

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe subscription events

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup

The application uses Supabase (PostgreSQL-based) which provides:
- Managed PostgreSQL database
- Built-in authentication (optional)
- Real-time subscriptions
- File storage
- Edge functions

## Development

### Database Commands

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### Code Structure

```
app/
├── (auth)/          # Authentication pages
├── api/             # API routes
├── dashboard/       # Dashboard pages
├── interviews/      # Interview pages
└── pricing/         # Pricing page

components/
├── ui/              # Reusable UI components
└── ...              # Feature components

lib/
├── db.ts            # Database connection
├── schema.ts        # Database schema
├── ai.ts            # AI service integration
├── vapi.ts          # Vapi.ai integration
├── stripe.ts        # Stripe integration
└── utils.ts         # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under @layfirto.

## Support

For support, email shelkerohan7309@gmail.com or create an issue in the repository.
