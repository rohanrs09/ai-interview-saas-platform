import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

export function calculateScore(questions: Array<{ score: number | null }>): number {
  const validScores = questions.filter(q => q.score !== null) as Array<{ score: number }>
  if (validScores.length === 0) return 0
  
  const totalScore = validScores.reduce((sum, q) => sum + q.score, 0)
  return Math.round(totalScore / validScores.length)
}

export function extractSkillsFromText(text: string): string[] {
  // This is a simple implementation - in production, you'd use AI/NLP
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Java',
    'C++', 'C#', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
    'Kubernetes', 'Git', 'Linux', 'Agile', 'Scrum', 'Machine Learning', 'AI',
    'Data Science', 'Frontend', 'Backend', 'Full Stack', 'DevOps', 'Cloud Computing'
  ]
  
  const foundSkills: string[] = []
  const lowerText = text.toLowerCase()
  
  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })
  
  return [...new Set(foundSkills)] // Remove duplicates
}
