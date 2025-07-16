import { ComponentInfo, ComponentExample, ComponentVariant } from './types'

export interface CodeGenerationOptions {
  includeImports?: boolean
  includeWrapper?: boolean
  version?: 'original' | 'css-modules'
  variant?: string
  format?: 'component' | 'usage' | 'full-example'
}

export class CodeGenerator {
  /**
   * Generate complete code example for a component
   */
  static generateComponentCode(
    component: ComponentInfo,
    example: ComponentExample,
    options: CodeGenerationOptions = {}
  ): string {
    const {
      includeImports = true,
      includeWrapper = false,
      version = 'css-modules',
      variant,
      format = 'component'
    } = options

    let code = ''

    // Add imports
    if (includeImports) {
      code += this.generateImports(component, example, version)
      code += '\n\n'
    }

    // Add the main component code
    switch (format) {
      case 'usage':
        code += this.generateUsageExample(component, example, variant)
        break
      case 'full-example':
        code += this.generateFullExample(component, example, variant, includeWrapper)
        break
      default:
        // Use the existing code from the example, but update imports for version
        code += this.updateCodeForVersion(example.code, version)
    }

    return code.trim()
  }

  /**
   * Update existing code to use the correct version imports
   */
  static updateCodeForVersion(code: string, version: 'original' | 'css-modules'): string {
    if (version === 'css-modules') {
      return code.replace(
        /@\/components\/ui\//g,
        '@/components/shadcss-ui/'
      )
    } else {
      return code.replace(
        /@\/components\/shadcss-ui\//g,
        '@/components/ui/'
      )
    }
  }

  /**
   * Generate import statements based on component and version
   */
  static generateImports(
    component: ComponentInfo,
    example: ComponentExample,
    version: 'original' | 'css-modules'
  ): string {
    const imports: string[] = []
    
    // Extract component imports from the example code
    const importMatches = example.code.match(/import\s+{[^}]+}\s+from\s+["'][^"']+["']/g)
    
    if (importMatches) {
      importMatches.forEach(importStatement => {
        // Convert import path based on version
        let convertedImport = importStatement
        
        if (version === 'css-modules') {
          convertedImport = importStatement.replace(
            /@\/components\/ui\//g,
            '@/components/shadcss-ui/'
          )
        } else {
          convertedImport = importStatement.replace(
            /@\/components\/shadcss-ui\//g,
            '@/components/ui/'
          )
        }
        
        imports.push(convertedImport)
      })
    }

    // Add React import if needed
    if (example.code.includes('useState') || example.code.includes('useEffect') || example.code.includes('React.')) {
      imports.unshift('import React, { useState, useEffect } from "react"')
    }

    return imports.join('\n')
  }

  /**
   * Generate simple usage example
   */
  static generateUsageExample(
    component: ComponentInfo,
    example: ComponentExample,
    variant?: string
  ): string {
    const componentName = component.name
    
    if (variant && component.variants.length > 0) {
      const selectedVariant = component.variants.find(v => v.name === variant)
      if (selectedVariant) {
        const props = Object.entries(selectedVariant.props)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')
        
        return `<${componentName} ${props}>\n  Content\n</${componentName}>`
      }
    }

    return `<${componentName}>\n  Content\n</${componentName}>`
  }

  /**
   * Generate full example with wrapper
   */
  static generateFullExample(
    component: ComponentInfo,
    example: ComponentExample,
    variant?: string,
    includeWrapper: boolean = false
  ): string {
    let code = example.code

    if (includeWrapper) {
      code = `export default function ${component.name}Demo() {
  return (
    <div className="p-8">
      ${code.replace(/^/gm, '      ').trim()}
    </div>
  )
}`
    }

    return code
  }

  /**
   * Generate installation commands for component dependencies
   */
  static generateInstallationCommands(component: ComponentInfo): {
    npm: string
    yarn: string
    pnpm: string
  } {
    const dependencies = component.dependencies
      .filter(dep => dep.type === 'peer' || dep.type === 'direct')
      .map(dep => dep.name)
      .join(' ')

    return {
      npm: `npm install ${dependencies}`,
      yarn: `yarn add ${dependencies}`,
      pnpm: `pnpm add ${dependencies}`
    }
  }

  /**
   * Generate CSS import statements for CSS modules version
   */
  static generateCSSImports(component: ComponentInfo): string {
    const cssModulePath = `@/components/shadcss-ui/${component.id}/${component.id}.module.css`
    return `import styles from "${cssModulePath}"`
  }

  /**
   * Generate setup instructions
   */
  static generateSetupInstructions(component: ComponentInfo): string {
    const instructions: string[] = []

    // Installation
    const installCommands = this.generateInstallationCommands(component)
    instructions.push('## Installation')
    instructions.push('```bash')
    instructions.push(installCommands.npm)
    instructions.push('```')
    instructions.push('')

    // Import
    instructions.push('## Import')
    instructions.push('```tsx')
    instructions.push(`import { ${component.name} } from "@/components/shadcss-ui/${component.id}"`)
    instructions.push('```')
    instructions.push('')

    // Usage
    instructions.push('## Usage')
    instructions.push('```tsx')
    instructions.push(`<${component.name}>`)
    instructions.push('  Your content here')
    instructions.push(`</${component.name}>`)
    instructions.push('```')

    return instructions.join('\n')
  }

  /**
   * Generate TypeScript interface for component props
   */
  static generatePropsInterface(component: ComponentInfo): string {
    if (component.variants.length === 0) {
      return ''
    }

    const props = new Set<string>()
    component.variants.forEach(variant => {
      Object.keys(variant.props).forEach(prop => props.add(prop))
    })

    const interfaceProps = Array.from(props).map(prop => {
      // Determine prop type based on common patterns
      let type = 'string'
      if (prop === 'disabled' || prop === 'loading') {
        type = 'boolean'
      } else if (prop === 'size') {
        type = '"sm" | "md" | "lg"'
      } else if (prop === 'variant') {
        const variants = component.variants.map(v => `"${v.name}"`).join(' | ')
        type = variants
      }
      
      return `  ${prop}?: ${type}`
    }).join('\n')

    return `interface ${component.name}Props {
${interfaceProps}
  children?: React.ReactNode
  className?: string
}`
  }

  /**
   * Generate variant-specific code example
   */
  static generateVariantExample(
    component: ComponentInfo,
    variant: ComponentVariant,
    version: 'original' | 'css-modules'
  ): string {
    const componentName = component.name
    const props = Object.entries(variant.props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')

    const importPath = version === 'css-modules' 
      ? `@/components/shadcss-ui/${component.id}`
      : `@/components/ui/${component.id}`

    return `import { ${componentName} } from "${importPath}"

export function ${componentName}${variant.name.charAt(0).toUpperCase() + variant.name.slice(1)}Demo() {
  return (
    <${componentName} ${props}>
      ${variant.description}
    </${componentName}>
  )
}`
  }

  /**
   * Generate interactive example with state management
   */
  static generateInteractiveExample(
    component: ComponentInfo,
    example: ComponentExample,
    version: 'original' | 'css-modules'
  ): string {
    const hasState = example.code.includes('useState') || example.code.includes('setChecked') || example.code.includes('setValue')
    
    if (!hasState) {
      return this.updateCodeForVersion(example.code, version)
    }

    // Extract state variables from the code
    const stateMatches = example.code.match(/const \[(\w+), set\w+\] = useState\(([^)]+)\)/g)
    const stateVariables = stateMatches?.map(match => {
      const [, varName, initialValue] = match.match(/const \[(\w+), set(\w+)\] = useState\(([^)]+)\)/) || []
      return { name: varName, setter: `set${varName.charAt(0).toUpperCase() + varName.slice(1)}`, initial: initialValue }
    }) || []

    let code = this.updateCodeForVersion(example.code, version)
    
    // Add state management comments
    if (stateVariables.length > 0) {
      const stateComments = stateVariables.map(state => 
        `  // ${state.name} state: ${state.initial} (initial value)`
      ).join('\n')
      
      code = code.replace(
        /export function \w+Demo\(\) \{/,
        `$&\n${stateComments}`
      )
    }

    return code
  }

  /**
   * Generate code with custom props
   */
  static generateCustomPropsExample(
    component: ComponentInfo,
    customProps: Record<string, any>,
    version: 'original' | 'css-modules'
  ): string {
    const componentName = component.name
    const props = Object.entries(customProps)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .join(' ')

    const importPath = version === 'css-modules' 
      ? `@/components/shadcss-ui/${component.id}`
      : `@/components/ui/${component.id}`

    return `import { ${componentName} } from "${importPath}"

export function Custom${componentName}Demo() {
  return (
    <${componentName} ${props}>
      Custom example
    </${componentName}>
  )
}`
  }

  /**
   * Generate complete playground code
   */
  static generatePlaygroundCode(
    component: ComponentInfo,
    selectedProps: Record<string, any>,
    version: 'original' | 'css-modules'
  ): string {
    const componentName = component.name
    const importPath = version === 'css-modules' 
      ? `@/components/shadcss-ui/${component.id}`
      : `@/components/ui/${component.id}`

    const propsString = Object.entries(selectedProps)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`
        } else if (typeof value === 'boolean') {
          return value ? key : `${key}={false}`
        } else {
          return `${key}={${JSON.stringify(value)}}`
        }
      })
      .join(' ')

    return `import { ${componentName} } from "${importPath}"

export function ${componentName}Playground() {
  return (
    <div className="p-4">
      <${componentName}${propsString ? ` ${propsString}` : ''}>
        Playground content
      </${componentName}>
    </div>
  )
}`
  }

  /**
   * Generate code with error boundaries
   */
  static generateSafeExample(
    component: ComponentInfo,
    example: ComponentExample,
    version: 'original' | 'css-modules'
  ): string {
    const baseCode = this.updateCodeForVersion(example.code, version)
    
    return `import React from "react"
${this.generateImports(component, example, version)}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Something went wrong.</div>
    }

    return this.props.children
  }
}

${baseCode.replace(/export function/, 'function')}

export default function Safe${component.name}Demo() {
  return (
    <ErrorBoundary>
      <${example.title.replace(/\s+/g, '')}Demo />
    </ErrorBoundary>
  )
}`
  }
}