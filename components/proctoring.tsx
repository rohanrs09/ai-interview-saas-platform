'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, Mic, MicOff, AlertTriangle, CheckCircle } from 'lucide-react'

interface ProctoringProps {
  onAnomaly?: (type: string, severity: 'low' | 'medium' | 'high') => void
  onLog?: (event: { type: string; data: any; timestamp: Date }) => void
}

export function Proctoring({ onAnomaly, onLog }: ProctoringProps) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [anomalies, setAnomalies] = useState<Array<{ type: string; severity: string; timestamp: Date }>>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring()
    } else {
      stopMonitoring()
    }

    return () => {
      stopMonitoring()
    }
  }, [isMonitoring])

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isAudioOn,
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Start periodic monitoring
      intervalRef.current = setInterval(() => {
        checkForAnomalies()
      }, 5000) // Check every 5 seconds

      onLog?.({
        type: 'monitoring_started',
        data: { video: isVideoOn, audio: isAudioOn },
        timestamp: new Date(),
      })
    } catch (error) {
      console.error('Error starting monitoring:', error)
      onAnomaly?.('permission_denied', 'high')
    }
  }

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    onLog?.({
      type: 'monitoring_stopped',
      data: {},
      timestamp: new Date(),
    })
  }

  const checkForAnomalies = () => {
    // Simple anomaly detection - in a real app, this would use more sophisticated AI
    const anomalies = []

    // Check if video is still active
    if (isVideoOn && videoRef.current) {
      const video = videoRef.current
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        anomalies.push({ type: 'video_lost', severity: 'high' })
      }
    }

    // Check for multiple faces (simplified)
    // In a real app, you'd use face detection APIs
    if (Math.random() < 0.1) { // 10% chance of false positive for demo
      anomalies.push({ type: 'multiple_faces', severity: 'medium' })
    }

    // Check for audio levels
    if (isAudioOn && Math.random() < 0.05) { // 5% chance for demo
      anomalies.push({ type: 'audio_anomaly', severity: 'low' })
    }

    anomalies.forEach(anomaly => {
      setAnomalies(prev => [...prev, { ...anomaly, timestamp: new Date() }])
      onAnomaly?.(anomaly.type, anomaly.severity as any)
      onLog?.({
        type: 'anomaly_detected',
        data: anomaly,
        timestamp: new Date(),
      })
    })
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
    if (isMonitoring) {
      stopMonitoring()
      setTimeout(() => {
        setIsMonitoring(true)
      }, 100)
    }
  }

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn)
    if (isMonitoring) {
      stopMonitoring()
      setTimeout(() => {
        setIsMonitoring(true)
      }, 100)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Video Preview */}
      {isVideoOn && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video Preview</CardTitle>
            <CardDescription>
              Your video feed for proctoring purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-48 bg-gray-900 rounded-lg object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  isMonitoring ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isMonitoring ? 'Monitoring' : 'Stopped'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proctoring Controls</CardTitle>
          <CardDescription>
            Manage your video and audio settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={isVideoOn ? "default" : "outline"}
              onClick={toggleVideo}
              disabled={isMonitoring}
            >
              {isVideoOn ? <Camera className="h-4 w-4 mr-2" /> : <CameraOff className="h-4 w-4 mr-2" />}
              {isVideoOn ? 'Video On' : 'Video Off'}
            </Button>
            
            <Button
              variant={isAudioOn ? "default" : "outline"}
              onClick={toggleAudio}
              disabled={isMonitoring}
            >
              {isAudioOn ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
              {isAudioOn ? 'Audio On' : 'Audio Off'}
            </Button>

            <Button
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies Log */}
      {anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Detected Anomalies
            </CardTitle>
            <CardDescription>
              Issues detected during the interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {anomalies.slice(-5).map((anomaly, index) => (
                <div
                  key={index}
                  className={`p-2 rounded border text-sm ${getSeverityColor(anomaly.severity)}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium capitalize">
                      {anomaly.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs">
                      {anomaly.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isMonitoring ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-sm font-medium">
                {isMonitoring ? 'Proctoring Active' : 'Proctoring Inactive'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {anomalies.length} anomalies detected
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
