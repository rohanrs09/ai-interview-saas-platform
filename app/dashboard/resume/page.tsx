'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function ResumePage() {
  const { user } = useUser()
  const [resumeText, setResumeText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedSkills, setUploadedSkills] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleTextUpload = async () => {
    if (!resumeText.trim()) {
      setError('Please enter your resume text')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      })

      if (!response.ok) {
        throw new Error('Failed to upload resume')
      }

      const data = await response.json()
      setUploadedSkills(data.extractedSkills || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
          <p className="text-gray-600">
            Upload your resume to extract skills and get personalized interview questions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Resume
              </CardTitle>
              <CardDescription>
                Paste your resume text below for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={12}
                className="resize-none"
              />
              
              {error && (
                <div className="flex items-center text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              <Button 
                onClick={handleTextUpload} 
                disabled={isUploading || !resumeText.trim()}
                className="w-full"
              >
                {isUploading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Extracted Skills
              </CardTitle>
              <CardDescription>
                Skills identified from your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedSkills.length > 0 ? (
                <div>
                  <div className="flex items-center text-green-600 text-sm mb-4">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {uploadedSkills.length} skills identified
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {uploadedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Upload your resume to see extracted skills</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Upload Resume</h3>
                <p className="text-sm text-gray-600">
                  Paste your resume text or upload a file
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI extracts your skills and experience
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Get Questions</h3>
                <p className="text-sm text-gray-600">
                  Receive personalized interview questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
