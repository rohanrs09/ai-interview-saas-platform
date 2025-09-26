'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, AlertCircle, CheckCircle, Clock, User, Bot } from 'lucide-react';
import { vapiService } from '@/lib/vapi';
import type { InterviewContext, VapiTranscript } from '@/lib/vapi';
import { cn } from '@/lib/utils';

interface VoiceInterviewProps {
  sessionId: string;
  candidateName: string;
  jobTitle: string;
  questions: Array<{
    id: string;
    text: string;
    questionType: 'technical' | 'behavioral' | 'situational';
    skillTag: string;
  }>;
  onComplete?: (transcripts: VapiTranscript[]) => void;
  onError?: (error: string) => void;
}

export function VoiceInterview({
  sessionId,
  candidateName,
  jobTitle,
  questions,
  onComplete,
  onError
}: VoiceInterviewProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<VapiTranscript[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState<'ready' | 'starting' | 'active' | 'ending' | 'completed' | 'error'>('ready');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Update duration every second during active interview
  useEffect(() => {
    if (isCallActive && interviewStartTime) {
      durationInterval.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - interviewStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [isCallActive, interviewStartTime]);

  // Auto-scroll transcripts
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Listen for Vapi errors
  useEffect(() => {
    const handleVapiError = (event: CustomEvent) => {
      const errorMessage = event.detail.error;
      setError(errorMessage);
      setInterviewStatus('error');
      onError?.(errorMessage);
    };

    window.addEventListener('vapi-error', handleVapiError as EventListener);
    return () => {
      window.removeEventListener('vapi-error', handleVapiError as EventListener);
    };
  }, [onError]);

  const startInterview = async () => {
    try {
      setInterviewStatus('starting');
      setError(null);
      
      const context: InterviewContext = {
        sessionId,
        questions,
        currentQuestionIndex: 0,
        candidateName,
        jobTitle
      };

      await vapiService.startVoiceInterview(context);
      setIsCallActive(true);
      setInterviewStartTime(new Date());
      setInterviewStatus('active');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview';
      setError(errorMessage);
      setInterviewStatus('error');
      onError?.(errorMessage);
    }
  };

  const endInterview = async () => {
    try {
      setInterviewStatus('ending');
      const finalTranscripts = await vapiService.endCall();
      setIsCallActive(false);
      setInterviewStatus('completed');
      onComplete?.(finalTranscripts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end interview';
      setError(errorMessage);
      setInterviewStatus('error');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Actual mute functionality would need to be implemented in Vapi service
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (interviewStatus) {
      case 'ready': return 'text-blue-600';
      case 'starting': return 'text-yellow-600';
      case 'active': return 'text-green-600';
      case 'ending': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (interviewStatus) {
      case 'ready': return <Clock className="h-4 w-4" />;
      case 'starting': return <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'ending': return <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Interview Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Voice Interview - {jobTitle}</span>
            <Badge variant="outline" className={cn("flex items-center gap-2", getStatusColor())}>
              {getStatusIcon()}
              {interviewStatus.charAt(0).toUpperCase() + interviewStatus.slice(1)}
            </Badge>
          </CardTitle>
          <CardDescription>
            AI-powered voice interview for {candidateName} • {questions.length} questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Duration: <span className="font-medium">{formatDuration(duration)}</span>
              </div>
              <div className="text-sm text-gray-600">
                Progress: <span className="font-medium">{currentQuestionIndex + 1}/{questions.length}</span>
              </div>
            </div>
            <Progress 
              value={(currentQuestionIndex / questions.length) * 100} 
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Controls</CardTitle>
            <CardDescription>
              Manage your voice interview session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4">
              {!isCallActive ? (
                <Button
                  size="lg"
                  onClick={startInterview}
                  disabled={interviewStatus === 'starting' || interviewStatus === 'error'}
                  className="bg-green-600 hover:bg-green-700 text-white px-8"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Start Interview
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={endInterview}
                  disabled={interviewStatus === 'ending'}
                  className="px-8"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Interview
                </Button>
              )}
              
              {isCallActive && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={toggleMute}
                  className={cn(
                    "px-6",
                    isMuted ? "bg-red-50 border-red-200 text-red-700" : ""
                  )}
                >
                  {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
              )}
            </div>

            {/* Audio Level Indicator */}
            {isCallActive && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Audio Level</span>
                  <Volume2 className="h-4 w-4 text-gray-400" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-150"
                    style={{ width: `${Math.min(volumeLevel * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Current Question */}
            {isCallActive && questions[currentQuestionIndex] && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {questions[currentQuestionIndex].questionType || 'behavioral'}
                  </Badge>
                  <Badge variant="outline">
                    {questions[currentQuestionIndex].skillTag}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-blue-900">
                  Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].text}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Live Transcript</CardTitle>
            <CardDescription>
              Real-time conversation transcript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-3">
              {transcripts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Transcript will appear here when interview starts</p>
                  </div>
                </div>
              ) : (
                transcripts.map((transcript, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 p-3 rounded-lg",
                      transcript.speaker === 'assistant' 
                        ? "bg-blue-100 text-blue-900" 
                        : "bg-green-100 text-green-900"
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {transcript.speaker === 'assistant' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {transcript.speaker === 'assistant' ? 'Interviewer' : 'You'}
                        </span>
                        <span className="text-xs opacity-60">
                          {new Date(transcript.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{transcript.text}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      {interviewStatus === 'ready' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-900">Before you start:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Test your microphone and speakers</li>
                  <li>• Find a quiet environment for the interview</li>
                  <li>• The AI interviewer will guide you through each question</li>
                  <li>• Speak clearly and take your time to answer</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
