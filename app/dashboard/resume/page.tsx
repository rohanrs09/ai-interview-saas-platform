'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  FileText, 
  Upload as UploadIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  FileCheck,
  FileX,
  FileInput,
  X
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useUser } from '@clerk/nextjs'
import { Progress } from '@/components/ui/progress'

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumePage() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeText, setResumeText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedSkills, setUploadedSkills] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(null);
    setUploadedSkills([]);
    setFileName(file.name);

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('text/plain') && !file.name.endsWith('.txt')) {
      setError('Please upload a PDF or text file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 5MB');
      return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setResumeText(content);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleTextUpload = async () => {
    if (!resumeText.trim()) {
      setError('Please enter your resume text or upload a file');
      return;
    }

    if (resumeText.length < 100) {
      setError('Resume text is too short. Please provide more details.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeText }),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload resume');
      }

      setUploadedSkills(data.extractedSkills || []);
      setSuccess('Resume analyzed successfully!');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your resume');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setResumeText('');
    setUploadedSkills([]);
    setError(null);
    setSuccess(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Resume Analysis
        </h1>
        <p className="text-gray-600">
          Upload your resume to extract skills and get personalized interview questions
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UploadIcon className="h-5 w-5 mr-2" />
              Upload Resume
            </CardTitle>
            <CardDescription>
              Upload your resume file or paste the text below for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors ${error ? 'border-red-300' : 'border-gray-200'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
              />
              {fileName ? (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <FileCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                      {fileName}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                    <UploadIcon className="h-full w-full" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF or TXT (max. 5MB)
                  </p>
                </>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <Textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                setError(null);
              }}
              placeholder="Or paste your resume text here..."
              rows={8}
              className="resize-none min-h-[200px]"
            />
            
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Progress Bar */}
            {isUploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Analyzing resume...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                onClick={handleTextUpload} 
                disabled={isUploading || (!resumeText.trim() && !fileName)}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
              
              {(resumeText || fileName) && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClear}
                  disabled={isUploading}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

          {/* Results Section */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
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
        <Card className="mt-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-medium mb-2">Upload Resume</h3>
                <p className="text-sm text-gray-600">
                  Paste your resume text or upload a file
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-medium mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI extracts your skills and experience
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-medium mb-2">Get Questions</h3>
                <p className="text-sm text-gray-600">
                  Receive personalized interview questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    </DashboardLayout>
  )
}
