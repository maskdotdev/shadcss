'use client'

import React, { useState, useCallback, useMemo, ErrorInfo, useEffect } from 'react'
import { ComponentInfo, ComponentVersion, ComponentVariant, ComponentExample } from '../lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Button } from '@/components/shadcss-ui/button'
import { Badge } from '@/components/shadcss-ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcss-ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcss-ui/tabs'
import { Alert, AlertDescription } from '@/components/shadcss-ui/alert'
import { Separator } from '@/components/shadcss-ui/separator'
import { VersionToggle } from './VersionToggle'

interface ComponentPreviewProps {
  component: ComponentInfo
  version: ComponentVersion
  selectedVariant?: string
  onVariantChange?: (variant: string) => void
  onVersionChange?: (version: ComponentVersion) => void
  showVersionToggle?: boolean
  className?: string
}

interface ComponentPreviewState {
  activeExample: number
  interactionState: Record<string, unknown>
  error: string | null
}

// Error Boundary Component
class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error, errorInfo: ErrorInfo) => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to render component: {this.state.error?.message || 'Unknown error'}
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

// Component for rendering individual examples
interface ExampleRendererProps {
  example: ComponentExample
  variant?: ComponentVariant
  version: ComponentVersion
  interactionState: Record<string, unknown>
  onStateChange: (key: string, value: unknown) => void
}

function ExampleRenderer({ 
  example, 
  variant, 
  version, 
  interactionState, 
  onStateChange 
}: ExampleRendererProps) {
  const [renderError, setRenderError] = useState<string | null>(null)

  const handleError = useCallback((error: Error) => {
    setRenderError(error.message)
  }, [])

  // Create a wrapper component that provides state management for interactive examples
  const ExampleWrapper = useMemo(() => {
    if (!example.component) {
      return () => (
        <Alert>
          <AlertDescription>
            No component available for this example. This is likely a code-only example.
          </AlertDescription>
        </Alert>
      )
    }

    return function WrappedExample() {
      const ExampleComponent = example.component!
      
      // Apply variant props if available
      const props = variant ? { ...variant.props } : {}
      
      // Add interactive state management for common interactive components
      const componentName = example.title.toLowerCase()
      
      if (componentName.includes('checkbox') || componentName.includes('switch')) {
        const stateKey = `${example.title}_checked`
        props.checked = interactionState[stateKey] as boolean ?? false
        props.onCheckedChange = (checked: boolean) => onStateChange(stateKey, checked)
      }
      
      if (componentName.includes('input') || componentName.includes('textarea')) {
        const stateKey = `${example.title}_value`
        props.value = interactionState[stateKey] as string ?? ''
        props.onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
          onStateChange(stateKey, e.target.value)
      }
      
      if (componentName.includes('select')) {
        const stateKey = `${example.title}_value`
        props.value = interactionState[stateKey] as string ?? ''
        props.onValueChange = (value: string) => onStateChange(stateKey, value)
      }
      
      if (componentName.includes('slider')) {
        const stateKey = `${example.title}_value`
        props.value = interactionState[stateKey] as number[] ?? [50]
        props.onValueChange = (value: number[]) => onStateChange(stateKey, value)
      }
      
      if (componentName.includes('progress')) {
        const stateKey = `${example.title}_value`
        props.value = interactionState[stateKey] as number ?? 50
      }

      try {
        return <ExampleComponent {...props} />
      } catch (error) {
        throw new Error(`Failed to render ${example.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }, [example, variant, interactionState, onStateChange])

  if (renderError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {renderError}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ComponentErrorBoundary onError={handleError}>
      <div className="p-6 border rounded-lg bg-background">
        <ExampleWrapper />
      </div>
    </ComponentErrorBoundary>
  )
}

export function ComponentPreview({ 
  component, 
  version, 
  selectedVariant, 
  onVariantChange,
  onVersionChange,
  showVersionToggle = true,
  className 
}: ComponentPreviewProps) {
  const [state, setState] = useState<ComponentPreviewState>({
    activeExample: 0,
    interactionState: {},
    error: null
  })

  // Get available variants for the component
  const availableVariants = useMemo(() => {
    return component.variants || []
  }, [component.variants])

  // Get the currently selected variant
  const currentVariant = useMemo(() => {
    if (!selectedVariant || !availableVariants.length) return undefined
    return availableVariants.find(v => v.name === selectedVariant)
  }, [selectedVariant, availableVariants])

  // Get available examples
  const examples = useMemo(() => {
    return component.examples || []
  }, [component.examples])

  // Handle variant change
  const handleVariantChange = useCallback((variantName: string) => {
    onVariantChange?.(variantName)
    // Reset interaction state when variant changes
    setState(prev => ({
      ...prev,
      interactionState: {}
    }))
  }, [onVariantChange])

  // Handle example change
  const handleExampleChange = useCallback((exampleIndex: number) => {
    setState(prev => ({
      ...prev,
      activeExample: exampleIndex,
      interactionState: {} // Reset state when switching examples
    }))
  }, [])

  // Handle interaction state changes
  const handleStateChange = useCallback((key: string, value: unknown) => {
    setState(prev => ({
      ...prev,
      interactionState: {
        ...prev.interactionState,
        [key]: value
      }
    }))
  }, [])

  // Get current example
  const currentExample = examples[state.activeExample]

  if (!component) {
    return (
      <Alert>
        <AlertDescription>
          No component selected for preview.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className} data-component-preview>
      <Card role="region" aria-labelledby="component-preview-title">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle id="component-preview-title" className="flex items-center gap-2">
                {component.name}
                <Badge variant="outline" aria-label={`Version: ${version}`}>{version}</Badge>
              </CardTitle>
              <CardDescription id="component-description">
                {component.description}
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Version Toggle */}
              {showVersionToggle && onVersionChange && (
                <VersionToggle
                  component={component}
                  selectedVersion={version}
                  onVersionChange={onVersionChange}
                  showLabels={false}
                  className="flex-shrink-0"
                />
              )}
              
              {/* Variant Selector */}
              {availableVariants.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="variant-selector" className="text-sm text-muted-foreground">
                    Variant:
                  </label>
                  <Select 
                    value={selectedVariant || ''} 
                    onValueChange={handleVariantChange}
                  >
                    <SelectTrigger 
                      id="variant-selector"
                      className="w-[180px]"
                      aria-label="Select component variant"
                    >
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default" aria-label="Default variant">Default</SelectItem>
                      {availableVariants.map((variant) => (
                        <SelectItem 
                          key={variant.name} 
                          value={variant.name}
                          aria-label={`${variant.name} variant: ${variant.description}`}
                        >
                          {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Component Category and Dependencies */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="group" aria-label="Component metadata">
            <Badge variant="secondary" aria-label={`Category: ${component.category}`}>{component.category}</Badge>
            {component.radixPackage && (
              <Badge variant="outline" aria-label="Built with Radix UI">Radix UI</Badge>
            )}
            {component.externalLibraries?.map((lib) => (
              <Badge key={lib} variant="outline" aria-label={`Uses ${lib} library`}>{lib}</Badge>
            ))}
          </div>

          {/* Current Variant Info */}
          {currentVariant && (
            <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
              <strong>{currentVariant.name}:</strong> {currentVariant.description}
            </div>
          )}
          
          {/* Live region for variant changes */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {selectedVariant ? `${selectedVariant} variant selected` : 'Default variant selected'}
          </div>
        </CardHeader>

        <CardContent>
          {examples.length === 0 ? (
            <Alert>
              <AlertDescription>
                No examples available for this component yet.
              </AlertDescription>
            </Alert>
          ) : examples.length === 1 ? (
            // Single example - render directly
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">{currentExample.title}</h4>
                {currentExample.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {currentExample.description}
                  </p>
                )}
              </div>
              <ExampleRenderer
                example={currentExample}
                variant={currentVariant}
                version={version}
                interactionState={state.interactionState}
                onStateChange={handleStateChange}
              />
            </div>
          ) : (
            // Multiple examples - use tabs
            <Tabs 
              value={state.activeExample.toString()} 
              onValueChange={(value) => handleExampleChange(parseInt(value))}
              aria-label="Component examples"
            >
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3" role="tablist">
                {examples.map((example, index) => (
                  <TabsTrigger 
                    key={index} 
                    value={index.toString()}
                    aria-label={`${example.title} example${example.description ? `: ${example.description}` : ''}`}
                  >
                    {example.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {examples.map((example, index) => (
                <TabsContent 
                  key={index} 
                  value={index.toString()} 
                  className="space-y-4"
                  role="tabpanel"
                  aria-labelledby={`tab-${index}`}
                >
                  <div>
                    <h4 id={`example-${index}-title`} className="text-sm font-medium mb-2">
                      {example.title}
                    </h4>
                    {example.description && (
                      <p className="text-sm text-muted-foreground mb-4" id={`example-${index}-description`}>
                        {example.description}
                      </p>
                    )}
                  </div>
                  <div 
                    role="region" 
                    aria-labelledby={`example-${index}-title`}
                    aria-describedby={example.description ? `example-${index}-description` : undefined}
                  >
                    <ExampleRenderer
                      example={example}
                      variant={currentVariant}
                      version={version}
                      interactionState={state.interactionState}
                      onStateChange={handleStateChange}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
          
          {/* Live region for example changes */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {currentExample ? `Now showing ${currentExample.title} example` : ''}
          </div>

          {/* Interactive State Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && Object.keys(state.interactionState).length > 0 && (
            <>
              <Separator className="my-4" />
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">
                  Debug: Interactive State
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                  {JSON.stringify(state.interactionState, null, 2)}
                </pre>
              </details>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ComponentPreview