'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Button } from '@/components/shadcss-ui/button'
import { Badge } from '@/components/shadcss-ui/badge'
import { Progress } from '@/components/shadcss-ui/progress'
import { Alert, AlertDescription } from '@/components/shadcss-ui/alert'
import { Separator } from '@/components/shadcss-ui/separator'
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Circle,
  Lightbulb,
  Target,
  Keyboard,
  Mouse,
  Eye
} from 'lucide-react'

export interface TutorialStep {
  id: string
  title: string
  description: string
  content: React.ReactNode
  target?: string // CSS selector for highlighting
  action?: 'click' | 'type' | 'hover' | 'scroll' | 'wait'
  actionData?: any
  validation?: () => boolean
  hints?: string[]
  duration?: number // Auto-advance after duration (ms)
}

export interface Tutorial {
  id: string
  title: string
  description: string
  category: 'getting-started' | 'components' | 'advanced' | 'accessibility'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  prerequisites?: string[]
  steps: TutorialStep[]
}

interface InteractiveTutorialProps {
  tutorial: Tutorial
  onComplete?: (tutorialId: string) => void
  onExit?: () => void
  autoPlay?: boolean
  className?: string
}

interface TutorialState {
  currentStep: number
  isPlaying: boolean
  isCompleted: boolean
  completedSteps: Set<number>
  showHints: boolean
  userProgress: {
    startTime: number
    stepTimes: number[]
    interactions: number
  }
}

// Tutorial overlay component for highlighting elements
const TutorialOverlay: React.FC<{
  target: string | null
  onNext: () => void
  onPrev: () => void
  step: TutorialStep
  stepNumber: number
  totalSteps: number
}> = ({ target, onNext, onPrev, step, stepNumber, totalSteps }) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (target) {
      const element = document.querySelector(target) as HTMLElement
      if (element) {
        setTargetElement(element)
        const rect = element.getBoundingClientRect()
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [target])

  if (!target || !targetElement) return null

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Highlight box */}
      <div
        className="fixed z-50 border-2 border-blue-500 rounded-lg shadow-lg"
        style={{
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
        }}
      />
      
      {/* Tutorial popup */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm"
        style={{
          top: position.top + position.height + 16,
          left: Math.max(16, Math.min(position.left, window.innerWidth - 400))
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              Step {stepNumber} of {totalSteps}
            </Badge>
            <div className="flex items-center gap-1">
              {step.action === 'click' && <Mouse className="h-4 w-4" />}
              {step.action === 'type' && <Keyboard className="h-4 w-4" />}
              {step.action === 'hover' && <Eye className="h-4 w-4" />}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm">{step.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
          
          {step.hints && step.hints.length > 0 && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Hint:</strong> {step.hints[0]}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrev}
              disabled={stepNumber === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button size="sm" onClick={onNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export function InteractiveTutorial({
  tutorial,
  onComplete,
  onExit,
  autoPlay = false,
  className
}: InteractiveTutorialProps) {
  const [state, setState] = useState<TutorialState>({
    currentStep: 0,
    isPlaying: autoPlay,
    isCompleted: false,
    completedSteps: new Set(),
    showHints: false,
    userProgress: {
      startTime: Date.now(),
      stepTimes: [],
      interactions: 0
    }
  })

  const autoPlayTimerRef = useRef<NodeJS.Timeout>()
  const currentStep = tutorial.steps[state.currentStep]

  // Auto-advance logic
  useEffect(() => {
    if (state.isPlaying && currentStep?.duration) {
      autoPlayTimerRef.current = setTimeout(() => {
        handleNext()
      }, currentStep.duration)
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
      }
    }
  }, [state.currentStep, state.isPlaying, currentStep?.duration])

  // Handle step navigation
  const handleNext = useCallback(() => {
    setState(prev => {
      const newCompletedSteps = new Set(prev.completedSteps)
      newCompletedSteps.add(prev.currentStep)
      
      const newStepTimes = [...prev.userProgress.stepTimes]
      newStepTimes[prev.currentStep] = Date.now() - prev.userProgress.startTime

      if (prev.currentStep >= tutorial.steps.length - 1) {
        // Tutorial completed
        const finalState = {
          ...prev,
          isCompleted: true,
          isPlaying: false,
          completedSteps: newCompletedSteps,
          userProgress: {
            ...prev.userProgress,
            stepTimes: newStepTimes
          }
        }
        
        onComplete?.(tutorial.id)
        return finalState
      }

      return {
        ...prev,
        currentStep: prev.currentStep + 1,
        completedSteps: newCompletedSteps,
        userProgress: {
          ...prev.userProgress,
          stepTimes: newStepTimes,
          interactions: prev.userProgress.interactions + 1
        }
      }
    })
  }, [tutorial.id, tutorial.steps.length, onComplete])

  const handlePrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      userProgress: {
        ...prev.userProgress,
        interactions: prev.userProgress.interactions + 1
      }
    }))
  }, [])

  const handlePlayPause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }, [])

  const handleRestart = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 0,
      isCompleted: false,
      completedSteps: new Set(),
      isPlaying: false,
      userProgress: {
        startTime: Date.now(),
        stepTimes: [],
        interactions: 0
      }
    }))
  }, [])

  const handleStepClick = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: stepIndex,
      userProgress: {
        ...prev.userProgress,
        interactions: prev.userProgress.interactions + 1
      }
    }))
  }, [])

  const toggleHints = useCallback(() => {
    setState(prev => ({
      ...prev,
      showHints: !prev.showHints
    }))
  }, [])

  const progress = ((state.currentStep + 1) / tutorial.steps.length) * 100
  const elapsedTime = Math.floor((Date.now() - state.userProgress.startTime) / 1000 / 60)

  if (state.isCompleted) {
    return (
      <Card className={className}>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Tutorial Completed!</CardTitle>
          <CardDescription>
            Great job! You've completed the "{tutorial.title}" tutorial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{elapsedTime}m</div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{state.userProgress.interactions}</div>
              <div className="text-sm text-muted-foreground">Interactions</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-2">
            <Button onClick={handleRestart} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Tutorial
            </Button>
            <Button onClick={onExit} className="flex-1">
              Continue Exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {tutorial.title}
              </CardTitle>
              <CardDescription>{tutorial.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={tutorial.difficulty === 'beginner' ? 'default' : 
                             tutorial.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                {tutorial.difficulty}
              </Badge>
              <Badge variant="outline">{tutorial.estimatedTime}min</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{state.currentStep + 1} / {tutorial.steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Step */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                <Badge variant="outline">Step {state.currentStep + 1}</Badge>
              </div>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep.content}
              
              {state.showHints && currentStep.hints && (
                <Alert className="mt-4">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Hints:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {currentStep.hints.map((hint, index) => (
                        <li key={index} className="text-sm">{hint}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={state.currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
              >
                {state.isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleHints}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                {state.showHints ? 'Hide' : 'Show'} Hints
              </Button>
              <Button size="sm" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Step Overview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tutorial Steps</h4>
            <div className="grid grid-cols-1 gap-1">
              {tutorial.steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                    index === state.currentStep
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : state.completedSteps.has(index)
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {state.completedSteps.has(index) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : index === state.currentStep ? (
                    <Circle className="h-4 w-4 text-blue-600 fill-current" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="flex-1">{step.title}</span>
                  {index === state.currentStep && (
                    <Badge variant="outline" className="text-xs">Current</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Overlay */}
      {currentStep.target && (
        <TutorialOverlay
          target={currentStep.target}
          onNext={handleNext}
          onPrev={handlePrevious}
          step={currentStep}
          stepNumber={state.currentStep + 1}
          totalSteps={tutorial.steps.length}
        />
      )}
    </>
  )
}

export default InteractiveTutorial