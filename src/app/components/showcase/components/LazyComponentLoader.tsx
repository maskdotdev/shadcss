'use client'

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react'
import { ComponentInfo, ComponentVersion } from '../lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Button } from '@/components/shadcss-ui/button'
import { Alert, AlertDescription } from '@/components/shadcss-ui/alert'
import { Skeleton } from '@/components/shadcss-ui/skeleton'
import { Loader2, RefreshCw } from 'lucide-react'

// Lazy load heavy components
const ComponentPreview = lazy(() => import('./ComponentPreview'))
const CodeExample = lazy(() => import('./CodeExample').then(module => ({ default: module.CodeExample })))
const DependencyInfo = lazy(() => import('./DependencyInfo'))

// Lazy load Shiki syntax highlighting (lighter alternative)
const ShikiHighlighter = lazy(() => 
  import('shiki').then(module => ({ default: module }))
)

interface LazyComponentLoaderProps {
  component: ComponentInfo
  version: ComponentVersion
  activeTab: 'preview' | 'code' | 'dependencies'
  selectedVariant?: string
  onVariantChange?: (variant: string) => void
  onVersionChange?: (version: ComponentVersion) => void
}

interface LoadingState {
  preview: boolean
  code: boolean
  dependencies: boolean
  syntaxHighlighter: boolean
}

// Loading skeleton components
const PreviewSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <div className="border rounded-lg p-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

const CodeSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-20" />
    </div>
    <div className="border rounded-lg p-4 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
)

const DependenciesSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-40" />
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

// Error boundary for lazy loaded components
interface LazyErrorBoundaryState {
  hasError: boolean
  error: Error | null
  retryCount: number
}

class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  LazyErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): LazyErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component loading error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }))
    this.props.onRetry()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="space-y-3">
            <div>
              Failed to load component: {this.state.error?.message || 'Unknown error'}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleRetry}
              disabled={this.state.retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {this.state.retryCount >= 3 ? 'Max retries reached' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Loading indicator component
const LoadingIndicator = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8 text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin mr-2" />
    <span className="text-sm">{message}</span>
  </div>
)

export function LazyComponentLoader({
  component,
  version,
  activeTab,
  selectedVariant,
  onVariantChange,
  onVersionChange
}: LazyComponentLoaderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    preview: false,
    code: false,
    dependencies: false,
    syntaxHighlighter: false
  })

  const [retryKey, setRetryKey] = useState(0)

  // Preload components based on active tab
  useEffect(() => {
    const preloadComponent = async (tabName: keyof LoadingState) => {
      if (loadingState[tabName]) return

      setLoadingState(prev => ({ ...prev, [tabName]: true }))

      try {
        switch (tabName) {
          case 'preview':
            await import('./ComponentPreview')
            break
          case 'code':
            await Promise.all([
              import('./CodeExample'),
              import('shiki')
            ])
            setLoadingState(prev => ({ ...prev, syntaxHighlighter: true }))
            break
          case 'dependencies':
            await import('./DependencyInfo')
            break
        }
      } catch (error) {
        console.error(`Failed to preload ${tabName} component:`, error)
        setLoadingState(prev => ({ ...prev, [tabName]: false }))
      }
    }

    // Preload current tab immediately
    preloadComponent(activeTab)

    // Preload other tabs after a delay
    const preloadTimer = setTimeout(() => {
      const tabsToPreload: (keyof LoadingState)[] = ['preview', 'code', 'dependencies']
      tabsToPreload.forEach(tab => {
        if (tab !== activeTab) {
          preloadComponent(tab)
        }
      })
    }, 1000)

    return () => clearTimeout(preloadTimer)
  }, [activeTab, loadingState])

  const handleRetry = useCallback(() => {
    setRetryKey(prev => prev + 1)
    setLoadingState({
      preview: false,
      code: false,
      dependencies: false,
      syntaxHighlighter: false
    })
  }, [])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return (
          <LazyErrorBoundary onRetry={handleRetry}>
            <Suspense fallback={<PreviewSkeleton />}>
              <ComponentPreview
                key={`preview-${retryKey}`}
                component={component}
                version={version}
                selectedVariant={selectedVariant}
                onVariantChange={onVariantChange}
                onVersionChange={onVersionChange}
                showVersionToggle={true}
              />
            </Suspense>
          </LazyErrorBoundary>
        )

      case 'code':
        return (
          <LazyErrorBoundary onRetry={handleRetry}>
            <Suspense fallback={<CodeSkeleton />}>
              <CodeExample
                key={`code-${retryKey}`}
                component={component}
                version={version}
                showAllExamples={true}
              />
            </Suspense>
          </LazyErrorBoundary>
        )

      case 'dependencies':
        return (
          <LazyErrorBoundary onRetry={handleRetry}>
            <Suspense fallback={<DependenciesSkeleton />}>
              <DependencyInfo
                key={`deps-${retryKey}`}
                component={component}
                showInstallationGuide={true}
              />
            </Suspense>
          </LazyErrorBoundary>
        )

      default:
        return (
          <Alert>
            <AlertDescription>
              Unknown tab: {activeTab}
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Loading status indicator (only show during initial load) */}
      {!loadingState[activeTab] && (
        <LoadingIndicator message={`Loading ${activeTab} content...`} />
      )}

      {/* Tab content */}
      <div className={!loadingState[activeTab] ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {renderTabContent()}
      </div>

      {/* Preload status (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Debug: Lazy Loading Status</summary>
          <div className="mt-2 p-2 bg-muted rounded text-xs">
            <div>Preview: {loadingState.preview ? '✅ Loaded' : '⏳ Not loaded'}</div>
            <div>Code: {loadingState.code ? '✅ Loaded' : '⏳ Not loaded'}</div>
            <div>Dependencies: {loadingState.dependencies ? '✅ Loaded' : '⏳ Not loaded'}</div>
            <div>Syntax Highlighter: {loadingState.syntaxHighlighter ? '✅ Loaded' : '⏳ Not loaded'}</div>
            <div>Retry Key: {retryKey}</div>
          </div>
        </details>
      )}
    </div>
  )
}

export default LazyComponentLoader