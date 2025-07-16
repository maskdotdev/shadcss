import { CodeBlock } from './components/CodeBlock'
import { CodeExample } from './components/CodeExample'
import { DynamicCodeGenerator } from './components/DynamicCodeGenerator'
import { ComponentInfo, ComponentExample } from './lib/types'

const sampleTSXCode = `import { Button } from "@/components/shadcss-ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcss-ui/card"

export function ButtonDemo() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Button Examples</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </CardContent>
    </Card>
  )
}`

const sampleCSSCode = `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.875rem;
  font-weight: 500;
  transition: colors 0.15s ease-in-out;
}

.button:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.button:disabled {
  pointer-events: none;
  opacity: 0.5;
}`

// Sample component data for testing
const sampleComponent: ComponentInfo = {
  id: 'button',
  name: 'Button',
  description: 'A clickable button component with multiple variants',
  category: 'basic',
  dependencies: [
    {
      name: '@radix-ui/react-slot',
      version: '^1.2.3',
      type: 'direct',
      description: 'Provides slot functionality for polymorphic components',
      installCommand: 'npm install @radix-ui/react-slot',
      documentationUrl: 'https://radix-ui.com/primitives/docs/utilities/slot'
    },
    {
      name: 'class-variance-authority',
      version: '^0.7.1',
      type: 'direct',
      description: 'Utility for creating variant-based component APIs',
      installCommand: 'npm install class-variance-authority'
    }
  ],
  variants: [
    { name: 'default', description: 'Primary button style', props: { variant: 'default' } },
    { name: 'secondary', description: 'Secondary button style', props: { variant: 'secondary' } },
    { name: 'destructive', description: 'Destructive action button', props: { variant: 'destructive' } },
    { name: 'outline', description: 'Outlined button style', props: { variant: 'outline' } },
    { name: 'ghost', description: 'Minimal button style', props: { variant: 'ghost' } },
    { name: 'link', description: 'Link-styled button', props: { variant: 'link' } }
  ],
  examples: [],
  hasOriginalVersion: true,
  hasCssModulesVersion: true,
  radixPackage: '@radix-ui/react-slot'
}

const sampleExample: ComponentExample = {
  title: 'Button Variants',
  description: 'Demonstration of different button variants',
  code: sampleTSXCode,
  component: () => null // Placeholder component
}

export function CodeBlockTest() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Code Display System Test</h1>
      
      <div className="space-y-8">
        {/* Basic CodeBlock Tests */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">CodeBlock Component</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">TypeScript/TSX Example</h3>
              <CodeBlock
                code={sampleTSXCode}
                language="tsx"
                title="ButtonDemo.tsx"
                showLineNumbers={true}
                highlightLines={[8, 9, 10]}
                downloadable={true}
                filename="ButtonDemo.tsx"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">CSS Example</h3>
              <CodeBlock
                code={sampleCSSCode}
                language="css"
                title="button.module.css"
                showLineNumbers={true}
                downloadable={true}
                filename="button.module.css"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Installation Command</h3>
              <CodeBlock
                code="npm install @radix-ui/react-slot class-variance-authority"
                language="bash"
                showLineNumbers={false}
              />
            </div>
          </div>
        </section>

        {/* CodeExample Component Test */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">CodeExample Component</h2>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Complete Button Example</h3>
            <CodeExample
              component={sampleComponent}
              example={sampleExample}
              version="css-modules"
              showVariants={true}
              showInstallation={true}
            />
          </div>
        </section>

        {/* DynamicCodeGenerator Component Test */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Dynamic Code Generator</h2>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Interactive Code Generation</h3>
            <DynamicCodeGenerator
              component={sampleComponent}
              example={sampleExample}
            />
          </div>
        </section>
      </div>
    </div>
  )
}