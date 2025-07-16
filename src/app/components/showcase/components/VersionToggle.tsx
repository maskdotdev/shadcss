'use client'

import React, { useMemo } from 'react'
import { ComponentInfo, ComponentVersion } from '../lib/types'
import { Button } from '@/components/shadcss-ui/button'
import { Badge } from '@/components/shadcss-ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcss-ui/tabs'
import { Alert, AlertDescription } from '@/components/shadcss-ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/shadcss-ui/tooltip'

interface VersionToggleProps {
  component: ComponentInfo
  selectedVersion: ComponentVersion
  onVersionChange: (version: ComponentVersion) => void
  className?: string
  showLabels?: boolean
  showBadges?: boolean
  disabled?: boolean
}

interface VersionInfo {
  version: ComponentVersion
  label: string
  description: string
  available: boolean
  path?: string
}

export function VersionToggle({
  component,
  selectedVersion,
  onVersionChange,
  className,
  showLabels = true,
  showBadges = true,
  disabled = false
}: VersionToggleProps) {
  // Determine available versions and their information
  const versionInfo = useMemo((): VersionInfo[] => {
    return [
      {
        version: 'original',
        label: 'shadcn/ui',
        description: 'Original shadcn/ui components with Tailwind CSS',
        available: component.hasOriginalVersion,
        path: component.originalPath
      },
      {
        version: 'css-modules',
        label: 'CSS Modules',
        description: 'CSS Modules version with modular styles',
        available: component.hasCssModulesVersion,
        path: component.cssModulesPath
      }
    ]
  }, [component])

  // Get available versions only
  const availableVersions = useMemo(() => {
    return versionInfo.filter(info => info.available)
  }, [versionInfo])

  // Get current version info
  const currentVersionInfo = useMemo(() => {
    return versionInfo.find(info => info.version === selectedVersion)
  }, [versionInfo, selectedVersion])

  // Handle version change
  const handleVersionChange = (version: string) => {
    if (disabled) return
    onVersionChange(version as ComponentVersion)
  }

  // If no versions are available, show error
  if (availableVersions.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          No versions available for {component.name}
        </AlertDescription>
      </Alert>
    )
  }

  // If only one version is available, show info instead of toggle
  if (availableVersions.length === 1) {
    const singleVersion = availableVersions[0]
    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          {showLabels && (
            <span className="text-sm text-muted-foreground">Version:</span>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {singleVersion.label}
                  </Badge>
                  {showBadges && (
                    <Badge variant="secondary" className="text-xs">
                      Only Available
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{singleVersion.description}</p>
                {singleVersion.path && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Path: {singleVersion.path}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  // Multiple versions available - show toggle
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {showLabels && (
          <span className="text-sm text-muted-foreground">Version:</span>
        )}
        
        <Tabs 
          value={selectedVersion} 
          onValueChange={handleVersionChange}
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            {availableVersions.map((versionInfo) => (
              <TooltipProvider key={versionInfo.version}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger 
                      value={versionInfo.version}
                      disabled={disabled}
                      className="relative"
                    >
                      {versionInfo.label}
                      {showBadges && versionInfo.version === selectedVersion && (
                        <Badge 
                          variant="secondary" 
                          className="ml-2 text-xs px-1 py-0"
                        >
                          Active
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p>{versionInfo.description}</p>
                      {versionInfo.path && (
                        <p className="text-xs text-muted-foreground">
                          Path: {versionInfo.path}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </TabsList>
        </Tabs>

        {/* Version comparison info */}
        {showBadges && availableVersions.length === 2 && (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              Both Available
            </Badge>
          </div>
        )}
      </div>

      {/* Current version details */}
      {currentVersionInfo && (
        <div className="mt-2 text-xs text-muted-foreground">
          {currentVersionInfo.description}
          {currentVersionInfo.path && (
            <span className="block mt-1">
              Import path: <code className="bg-muted px-1 rounded">{currentVersionInfo.path}</code>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Alternative button-style version toggle
interface VersionToggleButtonsProps extends Omit<VersionToggleProps, 'showLabels'> {
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function VersionToggleButtons({
  component,
  selectedVersion,
  onVersionChange,
  className,
  showBadges = true,
  disabled = false,
  size = 'sm',
  variant = 'outline'
}: VersionToggleButtonsProps) {
  const versionInfo = useMemo((): VersionInfo[] => {
    return [
      {
        version: 'original',
        label: 'shadcn/ui',
        description: 'Original shadcn/ui components with Tailwind CSS',
        available: component.hasOriginalVersion,
        path: component.originalPath
      },
      {
        version: 'css-modules',
        label: 'CSS Modules',
        description: 'CSS Modules version with modular styles',
        available: component.hasCssModulesVersion,
        path: component.cssModulesPath
      }
    ]
  }, [component])

  const availableVersions = useMemo(() => {
    return versionInfo.filter(info => info.available)
  }, [versionInfo])

  const handleVersionChange = (version: ComponentVersion) => {
    if (disabled) return
    onVersionChange(version)
  }

  if (availableVersions.length <= 1) {
    return null // Don't show buttons if only one or no versions available
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        {availableVersions.map((versionInfo) => (
          <TooltipProvider key={versionInfo.version}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedVersion === versionInfo.version ? 'default' : variant}
                  size={size}
                  onClick={() => handleVersionChange(versionInfo.version)}
                  disabled={disabled}
                  className="relative"
                >
                  {versionInfo.label}
                  {showBadges && selectedVersion === versionInfo.version && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 text-xs px-1 py-0"
                    >
                      ✓
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p>{versionInfo.description}</p>
                  {versionInfo.path && (
                    <p className="text-xs text-muted-foreground">
                      Path: {versionInfo.path}
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}

// Hook for managing version state with localStorage persistence
export function useVersionToggle(componentId: string, defaultVersion: ComponentVersion = 'css-modules') {
  const [selectedVersion, setSelectedVersion] = React.useState<ComponentVersion>(() => {
    if (typeof window === 'undefined') return defaultVersion
    
    try {
      const stored = localStorage.getItem(`component-version-${componentId}`)
      return (stored as ComponentVersion) || defaultVersion
    } catch {
      return defaultVersion
    }
  })

  const handleVersionChange = React.useCallback((version: ComponentVersion) => {
    setSelectedVersion(version)
    
    try {
      localStorage.setItem(`component-version-${componentId}`, version)
    } catch {
      // Ignore localStorage errors
    }
  }, [componentId])

  return [selectedVersion, handleVersionChange] as const
}

// Hook for managing global version preference
export function useGlobalVersionPreference(defaultVersion: ComponentVersion = 'css-modules') {
  const [globalVersion, setGlobalVersion] = React.useState<ComponentVersion>(() => {
    if (typeof window === 'undefined') return defaultVersion
    
    try {
      const stored = localStorage.getItem('global-component-version-preference')
      return (stored as ComponentVersion) || defaultVersion
    } catch {
      return defaultVersion
    }
  })

  const handleGlobalVersionChange = React.useCallback((version: ComponentVersion) => {
    setGlobalVersion(version)
    
    try {
      localStorage.setItem('global-component-version-preference', version)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  return [globalVersion, handleGlobalVersionChange] as const
}

export default VersionToggle