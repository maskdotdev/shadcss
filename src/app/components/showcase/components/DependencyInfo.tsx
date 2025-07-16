'use client'

import React from 'react'
import { ComponentDependency, ComponentInfo } from '../lib/types'
import { Badge } from '@/components/shadcss-ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Separator } from '@/components/shadcss-ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcss-ui/tabs'
import { ExternalLink, Package, AlertCircle, CheckCircle, Copy, Terminal, Settings, Info, GitBranch, HardDrive, Zap } from 'lucide-react'
import { Button } from '@/components/shadcss-ui/button'
import { Progress } from '@/components/shadcss-ui/progress'
import { useState } from 'react'

interface DependencyInfoProps {
  component: ComponentInfo
  className?: string
}

interface DependencyCardProps {
  dependency: ComponentDependency
  isHighlighted?: boolean
}

interface InstallationGuideProps {
  dependencies: ComponentDependency[]
  componentName: string
}

interface DependencyVisualizationProps {
  dependencies: ComponentDependency[]
  componentName: string
}

interface BundleImpactInfo {
  name: string
  estimatedSize: string
  impact: 'low' | 'medium' | 'high'
  description: string
}

const DependencyVisualization: React.FC<DependencyVisualizationProps> = ({ dependencies, componentName }) => {
  // Bundle impact data for common packages
  const getBundleImpact = (packageName: string): BundleImpactInfo => {
    const bundleData: Record<string, BundleImpactInfo> = {
      '@radix-ui/react-dialog': {
        name: '@radix-ui/react-dialog',
        estimatedSize: '15.2 KB',
        impact: 'medium',
        description: 'Modal dialog primitive with focus management'
      },
      '@radix-ui/react-dropdown-menu': {
        name: '@radix-ui/react-dropdown-menu',
        estimatedSize: '12.8 KB',
        impact: 'medium',
        description: 'Dropdown menu with keyboard navigation'
      },
      '@radix-ui/react-select': {
        name: '@radix-ui/react-select',
        estimatedSize: '18.5 KB',
        impact: 'medium',
        description: 'Select component with search and filtering'
      },
      'cmdk': {
        name: 'cmdk',
        estimatedSize: '25.3 KB',
        impact: 'high',
        description: 'Command palette with fuzzy search'
      },
      'recharts': {
        name: 'recharts',
        estimatedSize: '156.7 KB',
        impact: 'high',
        description: 'Charting library with D3 integration'
      },
      'embla-carousel-react': {
        name: 'embla-carousel-react',
        estimatedSize: '32.1 KB',
        impact: 'high',
        description: 'Carousel with touch and drag support'
      },
      'react-hook-form': {
        name: 'react-hook-form',
        estimatedSize: '28.9 KB',
        impact: 'medium',
        description: 'Form library with validation'
      },
      'date-fns': {
        name: 'date-fns',
        estimatedSize: '67.4 KB',
        impact: 'high',
        description: 'Date utility library (tree-shakeable)'
      },
      'class-variance-authority': {
        name: 'class-variance-authority',
        estimatedSize: '3.2 KB',
        impact: 'low',
        description: 'Variant utility for component APIs'
      },
      'clsx': {
        name: 'clsx',
        estimatedSize: '1.1 KB',
        impact: 'low',
        description: 'Conditional className utility'
      },
      'tailwind-merge': {
        name: 'tailwind-merge',
        estimatedSize: '8.7 KB',
        impact: 'low',
        description: 'Tailwind class merging utility'
      }
    }

    return bundleData[packageName] || {
      name: packageName,
      estimatedSize: '~5-10 KB',
      impact: 'low',
      description: 'Estimated bundle impact'
    }
  }

  const getImpactColor = (impact: BundleImpactInfo['impact']) => {
    switch (impact) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }



  // Create dependency tree structure
  const createDependencyTree = () => {
    const peerDeps = dependencies.filter(dep => dep.type === 'peer')
    const directDeps = dependencies.filter(dep => dep.type === 'direct')
    
    return {
      component: componentName,
      peerDependencies: peerDeps,
      directDependencies: directDeps,
      totalSize: dependencies.reduce((acc, dep) => {
        const impact = getBundleImpact(dep.name)
        const sizeNum = parseFloat(impact.estimatedSize.replace(/[^\d.]/g, ''))
        return acc + (isNaN(sizeNum) ? 5 : sizeNum)
      }, 0)
    }
  }

  const dependencyTree = createDependencyTree()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Dependency Tree
          </CardTitle>
          <CardDescription>
            Visual representation of component dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Root Component */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-800">{componentName} (Component)</span>
            </div>

            {/* Direct Dependencies */}
            {dependencyTree.directDependencies.length > 0 && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="w-2 h-px bg-gray-300"></div>
                  Direct Dependencies
                </div>
                {dependencyTree.directDependencies.map((dep) => (
                  <div key={dep.name} className="ml-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="w-4 h-px bg-gray-300"></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <Package className="h-3 w-3 text-gray-600" />
                      <span className="text-sm font-mono">{dep.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {dep.version}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Peer Dependencies */}
            {dependencyTree.peerDependencies.length > 0 && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                  <div className="w-2 h-px bg-orange-300"></div>
                  Peer Dependencies
                </div>
                {dependencyTree.peerDependencies.map((dep) => (
                  <div key={dep.name} className="ml-4 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <div className="w-4 h-px bg-orange-300"></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                      <AlertCircle className="h-3 w-3 text-orange-600" />
                      <span className="text-sm font-mono">{dep.name}</span>
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                        {dep.version}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Bundle Impact Analysis
          </CardTitle>
          <CardDescription>
            Estimated bundle size and performance impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Total Bundle Impact */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Total Estimated Size</span>
                <span className="text-lg font-bold">{dependencyTree.totalSize.toFixed(1)} KB</span>
              </div>
              <Progress 
                value={Math.min((dependencyTree.totalSize / 200) * 100, 100)} 
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                Based on typical bundle sizes (may vary with tree-shaking)
              </p>
            </div>

            {/* Individual Package Impact */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Individual Package Impact</h4>
              {dependencies.map((dep) => {
                const impact = getBundleImpact(dep.name)
                return (
                  <div key={dep.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="font-mono text-sm">{dep.name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getImpactColor(impact.impact)}`}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {impact.impact} impact
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">{impact.estimatedSize}</div>
                      <div className="text-xs text-gray-600">{impact.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Performance Tips */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance Tips
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use dynamic imports for heavy components when possible</li>
                <li>• Enable tree-shaking in your bundler configuration</li>
                <li>• Consider code splitting for large dependencies</li>
                <li>• Monitor bundle size with tools like webpack-bundle-analyzer</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const InstallationGuide: React.FC<InstallationGuideProps> = ({ dependencies, componentName }) => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  const copyToClipboard = async (text: string, commandType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(commandType)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Generate installation commands for different package managers
  const generateInstallCommands = (deps: ComponentDependency[]) => {
    const packageNames = deps.map(dep => dep.name).join(' ')
    return {
      npm: `npm install ${packageNames}`,
      yarn: `yarn add ${packageNames}`,
      pnpm: `pnpm add ${packageNames}`
    }
  }

  const allDeps = dependencies
  const peerDeps = dependencies.filter(dep => dep.type === 'peer')
  const directDeps = dependencies.filter(dep => dep.type === 'direct')

  const allCommands = generateInstallCommands(allDeps)
  const peerCommands = peerDeps.length > 0 ? generateInstallCommands(peerDeps) : null


  // Setup instructions for complex components
  const getSetupInstructions = (componentName: string) => {
    const setupGuides: Record<string, string[]> = {
      'form': [
        'Install the form dependencies',
        'Set up Zod schema validation',
        'Configure React Hook Form resolver',
        'Import and use the Form components'
      ],
      'calendar': [
        'Install calendar dependencies',
        'Configure date-fns locale if needed',
        'Import Calendar component',
        'Handle date selection events'
      ],
      'chart': [
        'Install Recharts dependency',
        'Import chart components',
        'Prepare your data in the correct format',
        'Configure chart props and styling'
      ],
      'carousel': [
        'Install Embla Carousel dependency',
        'Import Carousel components',
        'Set up carousel content',
        'Configure carousel options (autoplay, loop, etc.)'
      ],
      'command': [
        'Install CMDK dependency',
        'Import Command components',
        'Set up command items and groups',
        'Handle command selection'
      ],
      'drawer': [
        'Install Vaul dependency',
        'Import Drawer components',
        'Set up drawer trigger and content',
        'Configure drawer behavior'
      ]
    }

    return setupGuides[componentName] || [
      'Install the required dependencies',
      'Import the component',
      'Use the component in your JSX',
      'Configure props as needed'
    ]
  }

  const setupSteps = getSetupInstructions(componentName)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Installation Guide
          </CardTitle>
          <CardDescription>
            Choose your preferred package manager to install dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="npm" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="npm">npm</TabsTrigger>
              <TabsTrigger value="yarn">Yarn</TabsTrigger>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
            </TabsList>
            
            <TabsContent value="npm" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Install All Dependencies</h4>
                <div className="relative">
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                    {allCommands.npm}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(allCommands.npm, 'npm-all')}
                  >
                    {copiedCommand === 'npm-all' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              {peerCommands && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Peer Dependencies Only
                  </h4>
                  <div className="relative">
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                      {peerCommands.npm}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(peerCommands.npm, 'npm-peer')}
                    >
                      {copiedCommand === 'npm-peer' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="yarn" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Install All Dependencies</h4>
                <div className="relative">
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                    {allCommands.yarn}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(allCommands.yarn, 'yarn-all')}
                  >
                    {copiedCommand === 'yarn-all' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              {peerCommands && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Peer Dependencies Only
                  </h4>
                  <div className="relative">
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                      {peerCommands.yarn}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(peerCommands.yarn, 'yarn-peer')}
                    >
                      {copiedCommand === 'yarn-peer' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="pnpm" className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Install All Dependencies</h4>
                <div className="relative">
                  <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                    {allCommands.pnpm}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(allCommands.pnpm, 'pnpm-all')}
                  >
                    {copiedCommand === 'pnpm-all' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              
              {peerCommands && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    Peer Dependencies Only
                  </h4>
                  <div className="relative">
                    <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                      {peerCommands.pnpm}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(peerCommands.pnpm, 'pnpm-peer')}
                    >
                      {copiedCommand === 'pnpm-peer' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Setup Instructions
          </CardTitle>
          <CardDescription>
            Follow these steps to set up the {componentName} component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {setupSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {peerDeps.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <Info className="h-5 w-5" />
              Peer Dependencies Notice
            </CardTitle>
            <CardDescription className="text-orange-700">
              This component requires peer dependencies that must be installed separately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-orange-800">
                Peer dependencies are not automatically installed. Make sure to install them manually:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                {peerDeps.map((dep) => (
                  <li key={dep.name}>
                    <span className="font-mono">{dep.name}</span> - {dep.description}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const DependencyCard: React.FC<DependencyCardProps> = ({ dependency, isHighlighted = false }) => {
  const getTypeColor = (type: ComponentDependency['type']) => {
    switch (type) {
      case 'peer':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'direct':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: ComponentDependency['type']) => {
    switch (type) {
      case 'peer':
        return <AlertCircle className="h-3 w-3" />
      case 'direct':
        return <CheckCircle className="h-3 w-3" />
      default:
        return <Package className="h-3 w-3" />
    }
  }

  return (
    <Card className={`transition-all duration-200 ${isHighlighted ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-sm'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-600" />
            {dependency.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`text-xs ${getTypeColor(dependency.type)} flex items-center gap-1`}
          >
            {getTypeIcon(dependency.type)}
            {dependency.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {dependency.version}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-sm mb-3">
          {dependency.description}
        </CardDescription>
        
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded text-xs font-mono">
            {dependency.installCommand}
          </div>
          
          {dependency.documentationUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => window.open(dependency.documentationUrl, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Documentation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const DependencyInfo: React.FC<DependencyInfoProps> = ({ component, className = '' }) => {
  const { dependencies, radixPackage, externalLibraries } = component

  // Separate dependencies by type
  const peerDependencies = dependencies.filter(dep => dep.type === 'peer')
  const directDependencies = dependencies.filter(dep => dep.type === 'direct')

  // Get Radix UI dependencies
  const radixDependencies = dependencies.filter(dep => 
    dep.name.startsWith('@radix-ui/') || dep.name === radixPackage
  )

  // Get external library dependencies
  const externalDependencies = dependencies.filter(dep => 
    externalLibraries?.includes(dep.name) || 
    !dep.name.startsWith('@radix-ui/') && dep.name !== 'class-variance-authority'
  )

  const hasDependencies = dependencies.length > 0

  if (!hasDependencies) {
    return (
      <Card className={className} role="region" aria-labelledby="no-dependencies-title">
        <CardHeader>
          <CardTitle id="no-dependencies-title" className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" aria-hidden="true" />
            Dependencies
          </CardTitle>
          <CardDescription>
            This component has no external dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-600" role="status">
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            No additional packages required
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Installation Guide */}
      <InstallationGuide dependencies={dependencies} componentName={component.id} />

      {/* Dependency Visualization */}
      <DependencyVisualization dependencies={dependencies} componentName={component.id} />

      <Card role="region" aria-labelledby="dependencies-overview-title">
        <CardHeader>
          <CardTitle id="dependencies-overview-title" className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" aria-hidden="true" />
            Dependencies Overview
          </CardTitle>
          <CardDescription>
            External packages required for this component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm" role="list" aria-label="Dependency statistics">
            <div className="flex justify-between" role="listitem">
              <span>Total Dependencies:</span>
              <Badge variant="outline" aria-label={`${dependencies.length} total dependencies`}>
                {dependencies.length}
              </Badge>
            </div>
            <div className="flex justify-between" role="listitem">
              <span>Peer Dependencies:</span>
              <Badge 
                variant="outline" 
                className="bg-orange-50 text-orange-700"
                aria-label={`${peerDependencies.length} peer dependencies`}
              >
                {peerDependencies.length}
              </Badge>
            </div>
            <div className="flex justify-between" role="listitem">
              <span>Direct Dependencies:</span>
              <Badge 
                variant="outline" 
                className="bg-blue-50 text-blue-700"
                aria-label={`${directDependencies.length} direct dependencies`}
              >
                {directDependencies.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radix UI Dependencies */}
      {radixDependencies.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            Radix UI Packages
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {radixDependencies.map((dependency) => (
              <DependencyCard 
                key={dependency.name} 
                dependency={dependency}
                isHighlighted={dependency.name === radixPackage}
              />
            ))}
          </div>
        </div>
      )}

      {/* External Library Dependencies */}
      {externalDependencies.length > 0 && (
        <div>
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
            External Libraries
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {externalDependencies.map((dependency) => (
              <DependencyCard 
                key={dependency.name} 
                dependency={dependency}
              />
            ))}
          </div>
        </div>
      )}

      {/* Utility Dependencies */}
      {dependencies.some(dep => dep.name === 'class-variance-authority' || dep.name === 'clsx' || dep.name === 'tailwind-merge') && (
        <div>
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full" />
            Utility Libraries
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {dependencies
              .filter(dep => dep.name === 'class-variance-authority' || dep.name === 'clsx' || dep.name === 'tailwind-merge')
              .map((dependency) => (
                <DependencyCard 
                  key={dependency.name} 
                  dependency={dependency}
                />
              ))}
          </div>
        </div>
      )}

      {/* All Dependencies List */}
      {dependencies.length > 3 && (
        <>
          <Separator />
          <div>
            <h3 className="text-md font-semibold mb-3">All Dependencies</h3>
            <div className="grid gap-3">
              {dependencies.map((dependency) => (
                <DependencyCard 
                  key={dependency.name} 
                  dependency={dependency}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DependencyInfo