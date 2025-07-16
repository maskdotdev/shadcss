'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Button } from '@/components/shadcss-ui/button'
import { Badge } from '@/components/shadcss-ui/badge'
import { Progress } from '@/components/shadcss-ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcss-ui/tabs'
import { Alert, AlertDescription } from '@/components/shadcss-ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/shadcss-ui/collapsible'
import { 
  AccessibilityTester, 
  AutomatedAccessibilityTesting, 
  ColorContrastValidator,
  type AccessibilityTestResult,
  type AccessibilityIssue,
  type ColorContrastResult
} from '../lib/accessibility-testing'
import { 
  Shield, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Play,
  Pause,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface AccessibilityPanelProps {
  targetElement?: HTMLElement | null
  componentName?: string
  className?: string
}

interface IssueGroupProps {
  title: string
  issues: AccessibilityIssue[]
  icon: React.ReactNode
  defaultOpen?: boolean
}

const IssueGroup: React.FC<IssueGroupProps> = ({ title, issues, icon, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  if (issues.length === 0) return null

  const getSeverityColor = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'serious': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'minor': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeColor = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error': return 'text-red-600'
      case 'warning': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
            <Badge variant="outline" className="ml-2">
              {issues.length}
            </Badge>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-3 pb-3">
        {issues.map((issue, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getTypeColor(issue.type)}`}
                >
                  {issue.type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {issue.severity}
                </Badge>
              </div>
              <code className="text-xs bg-white/50 px-2 py-1 rounded">
                {issue.rule}
              </code>
            </div>
            
            <p className="text-sm mb-2">{issue.message}</p>
            
            {issue.element && (
              <div className="text-xs text-muted-foreground">
                <strong>Element:</strong> {issue.element.tagName.toLowerCase()}
                {issue.element.id && `#${issue.element.id}`}
                {issue.element.className && `.${issue.element.className.split(' ').slice(0, 2).join('.')}`}
              </div>
            )}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

const ColorContrastTest: React.FC<{ element: HTMLElement }> = ({ element }) => {
  const [contrastResults, setContrastResults] = useState<ColorContrastResult[]>([])

  useEffect(() => {
    const testContrast = () => {
      const results: ColorContrastResult[] = []
      const textElements = element.querySelectorAll('*')
      
      textElements.forEach(el => {
        if (el.textContent?.trim()) {
          const result = ColorContrastValidator.validateElementContrast(el as HTMLElement)
          if (result) {
            results.push(result)
          }
        }
      })

      // Remove duplicates
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => 
          r.foreground === result.foreground && 
          r.background === result.background
        )
      )

      setContrastResults(uniqueResults)
    }

    testContrast()
  }, [element])

  const getLevelColor = (level: ColorContrastResult['level']) => {
    switch (level) {
      case 'AAA': return 'text-green-600 bg-green-50 border-green-200'
      case 'AA': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'A': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'FAIL': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Color Contrast Analysis</h4>
        <Badge variant="outline">
          {contrastResults.length} combinations tested
        </Badge>
      </div>
      
      {contrastResults.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No text elements found to test color contrast.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {contrastResults.map((result, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getLevelColor(result.level)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge 
                  variant="outline" 
                  className={getLevelColor(result.level)}
                >
                  {result.level}
                </Badge>
                <span className="text-sm font-mono">
                  {result.ratio}:1
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: result.foreground }}
                  title={`Foreground: ${result.foreground}`}
                />
                <span>on</span>
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: result.background }}
                  title={`Background: ${result.background}`}
                />
                <span className="text-muted-foreground">
                  {result.passed ? 'Passes' : 'Fails'} WCAG standards
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  targetElement,
  componentName = 'Component',
  className = ''
}) => {
  const [testResult, setTestResult] = useState<AccessibilityTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Run accessibility test
  const runTest = async () => {
    if (!targetElement) return

    setIsLoading(true)
    try {
      const result = await AccessibilityTester.runFullTest(targetElement)
      setTestResult(result)
      setLastTestTime(new Date())
    } catch (error) {
      console.error('Accessibility test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle continuous monitoring
  const toggleMonitoring = () => {
    if (!targetElement) return

    if (isMonitoring) {
      AutomatedAccessibilityTesting.stopContinuousMonitoring()
      setIsMonitoring(false)
    } else {
      AutomatedAccessibilityTesting.startContinuousMonitoring(targetElement, (result) => {
        setTestResult(result)
        setLastTestTime(new Date())
      })
      setIsMonitoring(true)
    }
  }

  // Download report
  const downloadReport = () => {
    if (!testResult) return

    const report = AccessibilityTester.generateReport(testResult)
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${componentName}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Run initial test when target element changes
  useEffect(() => {
    if (targetElement) {
      runTest()
    }
  }, [targetElement])

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      AutomatedAccessibilityTesting.stopContinuousMonitoring()
    }
  }, [])

  if (!targetElement) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accessibility Testing
          </CardTitle>
          <CardDescription>
            No component selected for accessibility testing
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const errorIssues = testResult?.issues.filter(i => i.type === 'error') || []
  const warningIssues = testResult?.issues.filter(i => i.type === 'warning') || []
  const infoIssues = testResult?.issues.filter(i => i.type === 'info') || []

  return (
    <div ref={panelRef} className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Accessibility Testing
              </CardTitle>
              <CardDescription>
                Testing {componentName} for WCAG compliance
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={runTest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Test
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMonitoring}
                className={isMonitoring ? 'bg-green-50 text-green-700' : ''}
              >
                {isMonitoring ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isMonitoring ? 'Stop' : 'Monitor'}
              </Button>
              
              {testResult && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadReport}
                >
                  <Download className="h-4 w-4" />
                  Report
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {testResult && (
          <CardContent>
            {/* Score and Status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Accessibility Score</span>
                <div className="flex items-center gap-2">
                  {testResult.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`font-bold ${getScoreColor(testResult.score)}`}>
                    {testResult.score}/100
                  </span>
                </div>
              </div>
              
              <Progress 
                value={testResult.score} 
                className="h-2 mb-2"
              />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {testResult.passed ? 'All critical issues resolved' : 'Critical issues found'}
                </span>
                {lastTestTime && (
                  <span>
                    Last tested: {lastTestTime.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testResult.summary.errors}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {testResult.summary.warnings}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {testResult.summary.info}
                </div>
                <div className="text-xs text-muted-foreground">Info</div>
              </div>
            </div>

            {/* Detailed Results */}
            <Tabs defaultValue="issues" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="contrast">Color Contrast</TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues" className="space-y-3">
                <IssueGroup
                  title="Critical Errors"
                  issues={errorIssues}
                  icon={<XCircle className="h-4 w-4 text-red-600" />}
                  defaultOpen={errorIssues.length > 0}
                />
                
                <IssueGroup
                  title="Warnings"
                  issues={warningIssues}
                  icon={<AlertTriangle className="h-4 w-4 text-yellow-600" />}
                />
                
                <IssueGroup
                  title="Recommendations"
                  issues={infoIssues}
                  icon={<Info className="h-4 w-4 text-blue-600" />}
                />

                {testResult.issues.length === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      No accessibility issues found! This component meets WCAG standards.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="contrast">
                <ColorContrastTest element={targetElement} />
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  )
}