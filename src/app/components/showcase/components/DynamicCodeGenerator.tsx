'use client'

import { useState } from 'react'
import { CodeBlock } from './CodeBlock'
import { CodeGenerator } from '../lib/code-generator'
import { ComponentInfo, ComponentExample, ComponentVariant } from '../lib/types'
import { Button } from '@/components/shadcss-ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcss-ui/select'
import { Switch } from '@/components/shadcss-ui/switch'
import { Label } from '@/components/shadcss-ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcss-ui/tabs'
import { Badge } from '@/components/shadcss-ui/badge'

interface DynamicCodeGeneratorProps {
  component: ComponentInfo
  example: ComponentExample
  className?: string
}

export function DynamicCodeGenerator({
  component,
  example,
  className = ''
}: DynamicCodeGeneratorProps) {
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [version, setVersion] = useState<'original' | 'css-modules'>('css-modules')
  const [includeImports, setIncludeImports] = useState(true)
  const [includeWrapper, setIncludeWrapper] = useState(false)
  const [customProps, setCustomProps] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('basic')

  // Generate different types of code
  const basicCode = CodeGenerator.generateComponentCode(component, example, {
    version,
    includeImports,
    format: 'component'
  })

  const variantCode = selectedVariant 
    ? CodeGenerator.generateVariantExample(
        component,
        component.variants.find(v => v.name === selectedVariant)!,
        version
      )
    : ''

  const interactiveCode = CodeGenerator.generateInteractiveExample(
    component,
    example,
    version
  )

  const playgroundCode = CodeGenerator.generatePlaygroundCode(
    component,
    customProps,
    version
  )

  const installationCommands = CodeGenerator.generateInstallationCommands(component)
  const propsInterface = CodeGenerator.generatePropsInterface(component)

  const handleAddCustomProp = (key: string, value: any) => {
    setCustomProps(prev => ({ ...prev, [key]: value }))
  }

  const handleRemoveCustomProp = (key: string) => {
    setCustomProps(prev => {
      const newProps = { ...prev }
      delete newProps[key]
      return newProps
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Code Generation Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Version Toggle */}
            <div className="space-y-2">
              <Label>Version</Label>
              <Select value={version} onValueChange={(value: 'original' | 'css-modules') => setVersion(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="css-modules">CSS Modules</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Variant Selection */}
            {component.variants.length > 0 && (
              <div className="space-y-2">
                <Label>Variant</Label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger>
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

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-imports"
                  checked={includeImports}
                  onCheckedChange={setIncludeImports}
                />
                <Label htmlFor="include-imports">Include imports</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-wrapper"
                  checked={includeWrapper}
                  onCheckedChange={setIncludeWrapper}
                />
                <Label htmlFor="include-wrapper">Include wrapper</Label>
              </div>
            </div>

            {/* Custom Props */}
            <div className="space-y-2">
              <Label>Custom Props</Label>
              <div className="space-y-2">
                {Object.entries(customProps).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge variant="secondary">{key}={String(value)}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCustomProp(key)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddCustomProp('className', 'custom-class')}
                >
                  Add className
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Code */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="variant">Variant</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <CodeBlock
            code={basicCode}
            language="tsx"
            title={`${component.name} - Basic Example`}
            copyable={true}
            downloadable={true}
            filename={`${component.name}Basic.tsx`}
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

        <TabsContent value="variant" className="space-y-4">
          {selectedVariant ? (
            <CodeBlock
              code={variantCode}
              language="tsx"
              title={`${component.name} - ${selectedVariant} Variant`}
              copyable={true}
              downloadable={true}
              filename={`${component.name}${selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)}.tsx`}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select a variant to see the generated code
            </div>
          )}
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4">
          <CodeBlock
            code={interactiveCode}
            language="tsx"
            title={`${component.name} - Interactive Example`}
            copyable={true}
            downloadable={true}
            filename={`${component.name}Interactive.tsx`}
          />
        </TabsContent>

        <TabsContent value="playground" className="space-y-4">
          <CodeBlock
            code={playgroundCode}
            language="tsx"
            title={`${component.name} - Playground`}
            copyable={true}
            downloadable={true}
            filename={`${component.name}Playground.tsx`}
          />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Installation Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>npm</Label>
                  <CodeBlock
                    code={installationCommands.npm}
                    language="bash"
                    copyable={true}
                    showLineNumbers={false}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>yarn</Label>
                  <CodeBlock
                    code={installationCommands.yarn}
                    language="bash"
                    copyable={true}
                    showLineNumbers={false}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>pnpm</Label>
                  <CodeBlock
                    code={installationCommands.pnpm}
                    language="bash"
                    copyable={true}
                    showLineNumbers={false}
                  />
                </div>
              </CardContent>
            </Card>

            {version === 'css-modules' && (
              <Card>
                <CardHeader>
                  <CardTitle>CSS Modules Import</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    code={CodeGenerator.generateCSSImports(component)}
                    language="typescript"
                    copyable={true}
                    showLineNumbers={false}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}