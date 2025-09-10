'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Mic, MicOff, CameraOff, AlertTriangle, CheckCircle } from 'lucide-react'

interface ProctoringMonitorProps {
  sessionId: string
  onViolation?: (violation: ProctoringViolation) => void
  enabled?: boolean
}

interface ProctoringViolation {
  type: string
  severity: 'low' | 'medium' | 'high'
  message: string
  timestamp: Date
}

interface MediaPermissions {
  camera: boolean
  microphone: boolean
  screen: boolean
}

export function ProctoringMonitor({ sessionId, onViolation, enabled = true }: ProctoringMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [isActive, setIsActive] = useState(false)
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
    screen: false
  })
  const [violations, setViolations] = useState<ProctoringViolation[]>([])
  const [faceDetected, setFaceDetected] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  // Initialize media streams and permissions
  const initializeProctoring = useCallback(async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setPermissions({
        camera: stream.getVideoTracks().length > 0,
        microphone: stream.getAudioTracks().length > 0,
        screen: false
      })

      // Start proctoring session
      await fetch('/api/proctoring/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          },
          permissions: {
            camera: stream.getVideoTracks().length > 0,
            microphone: stream.getAudioTracks().length > 0
          }
        })
      })

      setIsActive(true)
      startMonitoring()

    } catch (error) {
      console.error('Failed to initialize proctoring:', error)
      logViolation('initialization_failed', 'high', 'Failed to access camera/microphone')
    }
  }, [sessionId])

  // Start monitoring for violations
  const startMonitoring = useCallback(() => {
    // Face detection monitoring
    intervalRef.current = setInterval(() => {
      detectFace()
      monitorAudioLevel()
    }, 2000)

    // Window focus monitoring
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch', 'medium', 'Candidate switched tabs or minimized window')
      }
    }

    const handleWindowBlur = () => {
      logViolation('window_blur', 'medium', 'Window lost focus')
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('fullscreen_exit', 'medium', 'Exited fullscreen mode')
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      logViolation('right_click_detected', 'low', 'Right-click detected')
    }

    const handleCopyPaste = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault()
        logViolation('copy_paste_detected', 'high', `${e.key === 'c' ? 'Copy' : e.key === 'v' ? 'Paste' : 'Cut'} attempt detected`)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleCopyPaste)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleCopyPaste)
    }
  }, [])

  // Simple face detection using video analysis
  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Simple brightness-based face detection (placeholder)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let brightness = 0

    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3
    }

    brightness = brightness / (data.length / 4)
    const facePresent = brightness > 50 && brightness < 200

    if (faceDetected && !facePresent) {
      logViolation('face_not_detected', 'high', 'Face not detected in camera feed')
    }

    setFaceDetected(facePresent)
  }, [faceDetected])

  // Monitor audio levels
  const monitorAudioLevel = useCallback(() => {
    if (!streamRef.current) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(streamRef.current)
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    microphone.connect(analyser)
    analyser.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setAudioLevel(average)

    audioContext.close()
  }, [])

  // Log proctoring violations
  const logViolation = useCallback(async (type: string, severity: 'low' | 'medium' | 'high', message: string) => {
    const violation: ProctoringViolation = {
      type,
      severity,
      message,
      timestamp: new Date()
    }

    setViolations(prev => [violation, ...prev.slice(0, 9)]) // Keep last 10 violations
    onViolation?.(violation)

    try {
      await fetch('/api/proctoring/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: type,
          severity,
          data: { message, timestamp: violation.timestamp.toISOString() }
        })
      })
    } catch (error) {
      console.error('Failed to log violation:', error)
    }
  }, [sessionId, onViolation])

  // Cleanup function
  const stopProctoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    setIsActive(false)
  }, [])

  useEffect(() => {
    if (enabled) {
      initializeProctoring()
    }

    return () => {
      stopProctoring()
    }
  }, [enabled, initializeProctoring, stopProctoring])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  if (!enabled) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Proctoring Monitor
            {isActive ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">
                Inactive
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {permissions.camera ? (
                <Camera className="h-4 w-4 text-green-500" />
              ) : (
                <CameraOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Camera</span>
            </div>
            <div className="flex items-center gap-2">
              {permissions.microphone ? (
                <Mic className="h-4 w-4 text-green-500" />
              ) : (
                <MicOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Microphone</span>
            </div>
            <div className="flex items-center gap-2">
              {faceDetected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Face Detected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded">
                <div 
                  className="h-full bg-green-500 rounded transition-all"
                  style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
                />
              </div>
              <span className="text-sm">Audio Level</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden video and canvas elements */}
      <div className="hidden">
        <video ref={videoRef} autoPlay muted />
        <canvas ref={canvasRef} />
      </div>

      {/* Recent Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {violations.map((violation, index) => (
                <Alert key={index} variant={violation.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>{violation.message}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(violation.severity) as any}>
                        {violation.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {violation.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isActive ? (
          <Button onClick={initializeProctoring} className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Start Proctoring
          </Button>
        ) : (
          <Button onClick={stopProctoring} variant="destructive" className="flex items-center gap-2">
            <CameraOff className="h-4 w-4" />
            Stop Proctoring
          </Button>
        )}
      </div>
    </div>
  )
}
