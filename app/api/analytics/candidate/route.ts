import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { interviewSessions, feedbackReports, interviewQuestions } from '@/lib/schema'
import { eq, desc, count, avg } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all interview sessions for the candidate
    const sessions = await db
      .select()
      .from(interviewSessions)
      .where(eq(interviewSessions.candidateId, userId))
      .orderBy(desc(interviewSessions.createdAt))

    // Get feedback reports for completed sessions
    const reports = await db
      .select({
        id: feedbackReports.id,
        sessionId: feedbackReports.sessionId,
        overallScore: feedbackReports.overallScore,
        summary: feedbackReports.summary,
        strengths: feedbackReports.strengths,
        weaknesses: feedbackReports.weaknesses,
        recommendations: feedbackReports.recommendations,
        ratedSkills: feedbackReports.ratedSkills,
        createdAt: feedbackReports.createdAt
      })
      .from(feedbackReports)
      .innerJoin(interviewSessions, eq(feedbackReports.sessionId, interviewSessions.id))
      .where(eq(interviewSessions.candidateId, userId))
      .orderBy(desc(feedbackReports.createdAt))

    // Calculate analytics
    const totalInterviews = sessions.length
    const completedInterviews = sessions.filter(s => s.status === 'completed').length
    const averageScore = reports.length > 0 
      ? reports.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reports.length 
      : 0

    // Get skill performance data
    const skillPerformance: Record<string, { totalQuestions: number; averageScore: number; scores: number[] }> = {}
    
    for (const session of sessions) {
      const questions = await db
        .select()
        .from(interviewQuestions)
        .where(eq(interviewQuestions.sessionId, session.id))

      for (const question of questions) {
        if (question.skillTag && question.score !== null) {
          if (!skillPerformance[question.skillTag]) {
            skillPerformance[question.skillTag] = {
              totalQuestions: 0,
              averageScore: 0,
              scores: []
            }
          }
          skillPerformance[question.skillTag].totalQuestions++
          skillPerformance[question.skillTag].scores.push(question.score)
        }
      }
    }

    // Calculate average scores for each skill
    Object.keys(skillPerformance).forEach(skill => {
      const scores = skillPerformance[skill].scores
      skillPerformance[skill].averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0
    })

    // Get recent activity (last 5 sessions)
    const recentSessions = sessions.slice(0, 5).map(session => ({
      id: session.id,
      status: session.status,
      createdAt: session.createdAt,
      jobId: session.jobId
    }))

    // Performance trend (last 10 completed interviews)
    const completedReports = reports.slice(0, 10)
    const performanceTrend = completedReports.reverse().map((report, index) => ({
      sessionNumber: index + 1,
      score: report.overallScore || 0,
      date: report.createdAt
    }))

    return NextResponse.json({
      success: true,
      analytics: {
        totalInterviews,
        completedInterviews,
        averageScore: Math.round(averageScore),
        skillPerformance: Object.entries(skillPerformance).map(([skill, data]) => ({
          skill,
          averageScore: Math.round(data.averageScore),
          totalQuestions: data.totalQuestions,
          improvement: data.scores.length > 1 
            ? data.scores[data.scores.length - 1] - data.scores[0] 
            : 0
        })),
        recentSessions,
        performanceTrend,
        strengthsAndWeaknesses: {
          topStrengths: reports.length > 0 
            ? [...new Set(reports.flatMap(r => {
                try {
                  return typeof r.strengths === 'string' ? JSON.parse(r.strengths) : r.strengths || []
                } catch {
                  return []
                }
              }))].slice(0, 5)
            : [],
          commonWeaknesses: reports.length > 0
            ? [...new Set(reports.flatMap(r => {
                try {
                  return typeof r.weaknesses === 'string' ? JSON.parse(r.weaknesses) : r.weaknesses || []
                } catch {
                  return []
                }
              }))].slice(0, 5)
            : []
        }
      }
    })

  } catch (error) {
    console.error('Error fetching candidate analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
