'use client'

import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import { CodeGenerator, type CodeGenerationOptions } from '../lib/code-generator'
import { ComponentInfo, ComponentExample } from '../lib/types'
import { Button } from '@/components/shadcss-ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcss-ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcss-ui/select'
import { Badge } from '@/components/shadcss-ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcss-ui/card'

interface CodeExampleProps {
  component: ComponentInfo
  example: ComponentExample
  version?: 'original' | 'css-modules'
  showVariants?: boolean
  showInstallation?: boolean
  className?: string
}

export function CodeExample({
  component,
  example,
  version = 'css-modules',
  showVariants = true,
  showInstallation = true,
  className = ''
}: CodeExampleProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string>('component')

  // Generate different code formats
  const componentCode = CodeGenerator.generateComponentCode(component, example, {
    version,
    variant: selectedVariant,
    format: 'component',
    includeImports: true
  })

  const usageCode = CodeGenerator.generateComponentCode(component, example, {
    version,
    variant: selectedVariant,
    format: 'usage',
    includeImports: false
  })

  const fullExampleCode = CodeGenerator.generateComponentCode(component, example, {
    version,
    variant: selectedVariant,
    format: 'full-example',
    includeImports: true,
    includeWrapper: true
  })

  const installationCommands = CodeGenerator.generateInstallationCommands(component)
  const setupInstructions = CodeGenerator.generateSetupInstructions(component)
  const propsInterface = CodeGenerator.generatePropsInterface(component)

  const handleCopyCode = (code: string) => {
    // Track code copying for analytics if needed
    console.log(`Code copied for ${component.name}:`, code.length, 'characters')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Variant Selector */}
      {showVariants && component.variants.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Variant:</span>
          <Select value={selectedVariant} onValueChange={setSelectedVariant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select variant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              {component.variants.map((variant) => (
                <SelectItem key={variant.name} value={variant.name}>
                  {variant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Code Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="component">Component</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="full">Full Example</TabsTrigger>
          {showInstallation && <TabsTrigger value="setup">Setup</TabsTrigger>}
        </TabsList>

        <TabsContent value="component" className="space-y-4">
          <CodeBlock
            code={componentCode}
            language="tsx"
            title={`${component.name}.tsx`}
            copyable={true}
            downloadable={true}
            filename={`${component.name}.tsx`}
            onCopy={handleCopyCode}
          />
          
          {propsInterface && (
            <CodeBlock
              code={propsInterface}
              language="typescript"
              title="Props Interface"
              copyable={true}
            />
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <CodeBlock
            code={usageCode}
            language="tsx"
            title="Basic Usage"
            copyable={true}
            onCopy={handleCopyCode}
          />
          
          {selectedVariant && (
            <div className="text-sm text-muted-foreground">
              <Badge variant="secondary">{selectedVariant}</Badge> variant selected
            </div>
          )}
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <CodeBlock
            code={fullExampleCode}
            language="tsx"
            title={`${component.name}Demo.tsx`}
            copyable={true}
            downloadable={true}
            filename={`${component.name}Demo.tsx`}
            onCopy={handleCopyCode}
          />
        </TabsContent>

        {showInstallation && (
          <TabsContent value="setup" className="space-y-4">
            <div className="grid gap-4">
              {/* Installation Commands */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">npm</h4>
                    <CodeBlock
                      code={installationCommands.npm}
                      language="bash"
                      copyable={true}
                      showLineNumbers={false}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">yarn</h4>
                    <CodeBlock
                      code={installationCommands.yarn}
                      language="bash"
                      copyable={true}
                      showLineNumbers={false}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">pnpm</h4>
                    <CodeBlock
                      code={installationCommands.pnpm}
                      language="bash"
                      copyable={true}
                      showLineNumbers={false}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies Info */}
              {component.dependencies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {component.dependencies.map((dep) => (
                        <div key={dep.name} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{dep.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {dep.type}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {dep.version}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CSS Modules Import */}
              {version === 'css-modules' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">CSS Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      code={CodeGenerator.generateCSSImports(component)}
                      language="typescript"
                      title="CSS Import"
                      copyable={true}
                      showLineNumbers={false}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}