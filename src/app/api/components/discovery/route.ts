import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { ComponentInfo, ComponentDependency, ComponentVariant, ComponentFileInfo, DependencyAnalysis } from '../../../components/showcase/lib/types'

// Mapping of component names to their categories
const COMPONENT_CATEGORIES: Record<string, ComponentInfo['category']> = {
  // Basic components
  'button': 'basic',
  'input': 'basic',
  'label': 'basic',
  'textarea': 'basic',
  'checkbox': 'basic',
  'radio-group': 'basic',
  'switch': 'basic',
  'slider': 'basic',
  'progress': 'basic',
  'badge': 'basic',
  'avatar': 'basic',
  'skeleton': 'basic',
  
  // Layout components
  'card': 'layout',
  'separator': 'layout',
  'aspect-ratio': 'layout',
  'scroll-area': 'layout',
  'resizable': 'layout',
  'sidebar': 'layout',
  'tabs': 'layout',
  'accordion': 'layout',
  'collapsible': 'layout',
  
  // Feedback components
  'alert': 'feedback',
  'sonner': 'feedback',
  'form': 'feedback',
  
  // Navigation components
  'breadcrumb': 'navigation',
  'navigation-menu': 'navigation',
  'menubar': 'navigation',
  'pagination': 'navigation',
  'command': 'navigation',
  
  // Data components
  'table': 'data',
  'calendar': 'data',
  'chart': 'data',
  'carousel': 'data',
  
  // Overlay components
  'dialog': 'overlay',
  'alert-dialog': 'overlay',
  'sheet': 'overlay',
  'drawer': 'overlay',
  'popover': 'overlay',
  'hover-card': 'overlay',
  'tooltip': 'overlay',
  'dropdown-menu': 'overlay',
  'context-menu': 'overlay',
  'select': 'overlay',
  'toggle': 'overlay',
  'toggle-group': 'overlay',
  'input-otp': 'overlay'
}

// Mapping of components to their Radix UI packages
const RADIX_PACKAGE_MAP: Record<string, string> = {
  'accordion': '@radix-ui/react-accordion',
  'alert-dialog': '@radix-ui/react-alert-dialog',
  'aspect-ratio': '@radix-ui/react-aspect-ratio',
  'avatar': '@radix-ui/react-avatar',
  'checkbox': '@radix-ui/react-checkbox',
  'collapsible': '@radix-ui/react-collapsible',
  'context-menu': '@radix-ui/react-context-menu',
  'dialog': '@radix-ui/react-dialog',
  'dropdown-menu': '@radix-ui/react-dropdown-menu',
  'hover-card': '@radix-ui/react-hover-card',
  'label': '@radix-ui/react-label',
  'menubar': '@radix-ui/react-menubar',
  'navigation-menu': '@radix-ui/react-navigation-menu',
  'popover': '@radix-ui/react-popover',
  'progress': '@radix-ui/react-progress',
  'radio-group': '@radix-ui/react-radio-group',
  'scroll-area': '@radix-ui/react-scroll-area',
  'select': '@radix-ui/react-select',
  'separator': '@radix-ui/react-separator',
  'slider': '@radix-ui/react-slider',
  'button': '@radix-ui/react-slot',
  'switch': '@radix-ui/react-switch',
  'tabs': '@radix-ui/react-tabs',
  'toggle': '@radix-ui/react-toggle',
  'toggle-group': '@radix-ui/react-toggle-group',
  'tooltip': '@radix-ui/react-tooltip'
}

// External library mappings
const EXTERNAL_LIBRARY_MAP: Record<string, string[]> = {
  'command': ['cmdk'],
  'sonner': ['sonner'],
  'drawer': ['vaul'],
  'carousel': ['embla-carousel-react'],
  'chart': ['recharts'],
  'calendar': ['react-day-picker', 'date-fns'],
  'form': ['react-hook-form', '@hookform/resolvers', 'zod'],
  'input-otp': ['input-otp'],
  'resizable': ['react-resizable-panels']
}

// Component descriptions
const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  'accordion': 'A vertically stacked set of interactive headings that each reveal a section of content',
  'alert': 'Displays a callout for user attention',
  'alert-dialog': 'A modal dialog that interrupts the user with important content and expects a response',
  'aspect-ratio': 'Displays content within a desired ratio',
  'avatar': 'An image element with a fallback for representing the user',
  'badge': 'Displays a badge or a component that looks like a badge',
  'breadcrumb': 'Displays the path to the current resource using a hierarchy of links',
  'button': 'Displays a button or a component that looks like a button',
  'calendar': 'A date field component that allows users to enter and edit date',
  'card': 'Displays a card with header, content, and footer',
  'carousel': 'A carousel with motion and swipe built using Embla',
  'chart': 'Charts built using Recharts and a simple wrapper',
  'checkbox': 'A control that allows the user to toggle between checked and not checked',
  'collapsible': 'An interactive component which expands/collapses a panel',
  'command': 'Fast, composable, unstyled command menu for React',
  'context-menu': 'Displays a menu to the user — such as a set of actions or functions — triggered by a button',
  'dialog': 'A window overlaid on either the primary window or another dialog window',
  'drawer': 'A drawer component for React',
  'dropdown-menu': 'Displays a menu to the user — such as a set of actions or functions — triggered by a button',
  'form': 'Building forms with validation and accessibility',
  'hover-card': 'For sighted users to preview content available behind a link',
  'input': 'Displays a form input field or a component that looks like an input field',
  'input-otp': 'Accessible one-time password component with copy paste functionality',
  'label': 'Renders an accessible label associated with controls',
  'menubar': 'A visually persistent menu common in desktop applications',
  'navigation-menu': 'A collection of links for navigating websites',
  'pagination': 'Pagination with page navigation, next and previous links',
  'popover': 'Displays rich content in a portal, triggered by a button',
  'progress': 'Displays an indicator showing the completion progress of a task',
  'radio-group': 'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time',
  'resizable': 'Accessible resizable panel groups and layouts with keyboard support',
  'scroll-area': 'Augments native scroll functionality for custom, cross-browser styling',
  'select': 'Displays a list of options for the user to pick from—triggered by a button',
  'separator': 'Visually or semantically separates content',
  'sheet': 'Extends the Dialog component to display content that complements the main content of the screen',
  'sidebar': 'A composable, themeable and customizable sidebar component',
  'skeleton': 'Use to show a placeholder while content is loading',
  'slider': 'An input where the user selects a value from within a given range',
  'sonner': 'An opinionated toast component for React',
  'switch': 'A control that allows the user to toggle between checked and not checked',
  'table': 'A responsive table component',
  'tabs': 'A set of layered sections of content—known as tab panels—that are displayed one at a time',
  'textarea': 'Displays a form textarea or a component that looks like a textarea',
  'toggle': 'A two-state button that can be either on or off',
  'toggle-group': 'A set of two-state buttons that can be toggled on or off',
  'tooltip': 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it'
}

/**
 * Enhanced dependency mapping with documentation URLs and detailed descriptions
 */
const DEPENDENCY_DETAILS: Record<string, { description: string; documentationUrl?: string; installCommand?: string }> = {
  // Radix UI packages
  '@radix-ui/react-accordion': {
    description: 'A vertically stacked set of interactive headings that each reveal a section of content',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/accordion'
  },
  '@radix-ui/react-alert-dialog': {
    description: 'A modal dialog that interrupts the user with important content and expects a response',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/alert-dialog'
  },
  '@radix-ui/react-aspect-ratio': {
    description: 'Displays content within a desired ratio',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/aspect-ratio'
  },
  '@radix-ui/react-avatar': {
    description: 'An image element with a fallback for representing the user',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/avatar'
  },
  '@radix-ui/react-checkbox': {
    description: 'A control that allows the user to toggle between checked and not checked',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/checkbox'
  },
  '@radix-ui/react-collapsible': {
    description: 'An interactive component which expands/collapses a panel',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/collapsible'
  },
  '@radix-ui/react-context-menu': {
    description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a right-click',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/context-menu'
  },
  '@radix-ui/react-dialog': {
    description: 'A window overlaid on either the primary window or another dialog window',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/dialog'
  },
  '@radix-ui/react-dropdown-menu': {
    description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a button',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/dropdown-menu'
  },
  '@radix-ui/react-hover-card': {
    description: 'For sighted users to preview content available behind a link',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/hover-card'
  },
  '@radix-ui/react-label': {
    description: 'Renders an accessible label associated with controls',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/label'
  },
  '@radix-ui/react-menubar': {
    description: 'A visually persistent menu common in desktop applications',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/menubar'
  },
  '@radix-ui/react-navigation-menu': {
    description: 'A collection of links for navigating websites',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/navigation-menu'
  },
  '@radix-ui/react-popover': {
    description: 'Displays rich content in a portal, triggered by a button',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/popover'
  },
  '@radix-ui/react-progress': {
    description: 'Displays an indicator showing the completion progress of a task',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/progress'
  },
  '@radix-ui/react-radio-group': {
    description: 'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/radio-group'
  },
  '@radix-ui/react-scroll-area': {
    description: 'Augments native scroll functionality for custom, cross-browser styling',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/scroll-area'
  },
  '@radix-ui/react-select': {
    description: 'Displays a list of options for the user to pick from—triggered by a button',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/select'
  },
  '@radix-ui/react-separator': {
    description: 'Visually or semantically separates content',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/separator'
  },
  '@radix-ui/react-slider': {
    description: 'An input where the user selects a value from within a given range',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/slider'
  },
  '@radix-ui/react-slot': {
    description: 'Merges its props onto its immediate child',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/utilities/slot'
  },
  '@radix-ui/react-switch': {
    description: 'A control that allows the user to toggle between checked and not checked',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/switch'
  },
  '@radix-ui/react-tabs': {
    description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/tabs'
  },
  '@radix-ui/react-toggle': {
    description: 'A two-state button that can be either on or off',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/toggle'
  },
  '@radix-ui/react-toggle-group': {
    description: 'A set of two-state buttons that can be toggled on or off',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/toggle-group'
  },
  '@radix-ui/react-tooltip': {
    description: 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it',
    documentationUrl: 'https://www.radix-ui.com/primitives/docs/components/tooltip'
  },
  
  // External libraries
  'cmdk': {
    description: 'Fast, composable, unstyled command menu for React',
    documentationUrl: 'https://cmdk.paco.me/'
  },
  'sonner': {
    description: 'An opinionated toast component for React',
    documentationUrl: 'https://sonner.emilkowal.ski/'
  },
  'vaul': {
    description: 'An unstyled drawer component for React',
    documentationUrl: 'https://vaul.emilkowal.ski/'
  },
  'embla-carousel-react': {
    description: 'A lightweight carousel library with fluid motion and great swipe precision',
    documentationUrl: 'https://www.embla-carousel.com/'
  },
  'recharts': {
    description: 'A composable charting library built on React components',
    documentationUrl: 'https://recharts.org/'
  },
  'react-day-picker': {
    description: 'A date picker component for React',
    documentationUrl: 'https://react-day-picker.js.org/'
  },
  'date-fns': {
    description: 'Modern JavaScript date utility library',
    documentationUrl: 'https://date-fns.org/'
  },
  'react-hook-form': {
    description: 'Performant, flexible and extensible forms with easy validation',
    documentationUrl: 'https://react-hook-form.com/'
  },
  '@hookform/resolvers': {
    description: 'Validation resolvers for React Hook Form',
    documentationUrl: 'https://react-hook-form.com/get-started#SchemaValidation'
  },
  'zod': {
    description: 'TypeScript-first schema validation with static type inference',
    documentationUrl: 'https://zod.dev/'
  },
  'input-otp': {
    description: 'One-time password input component for React',
    documentationUrl: 'https://input-otp.rodz.dev/'
  },
  'react-resizable-panels': {
    description: 'React components for resizable panel groups/layouts',
    documentationUrl: 'https://github.com/bvaughn/react-resizable-panels'
  },
  'class-variance-authority': {
    description: 'CVA - Create variant-based component APIs',
    documentationUrl: 'https://cva.style/docs'
  },
  'clsx': {
    description: 'A tiny utility for constructing className strings conditionally',
    documentationUrl: 'https://github.com/lukeed/clsx'
  },
  'tailwind-merge': {
    description: 'Merge Tailwind CSS classes without style conflicts',
    documentationUrl: 'https://github.com/dcastil/tailwind-merge'
  }
}

/**
 * Scans a directory for component files and returns their information
 */
function scanComponentDirectory(dirPath: string, isOriginal: boolean = true): string[] {
  try {
    if (!fs.existsSync(dirPath)) {
      return []
    }
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
    
    if (isOriginal) {
      // For original components, look for .tsx files
      return items
        .filter(item => item.isFile() && item.name.endsWith('.tsx'))
        .map(item => path.basename(item.name, '.tsx'))
    } else {
      // For CSS modules components, look for directories
      return items
        .filter(item => item.isDirectory())
        .map(item => item.name)
    }
  } catch (error) {
    console.warn(`Failed to scan directory ${dirPath}:`, error)
    return []
  }
}

/**
 * Extracts variant information from a component file
 */
function extractVariantsFromFile(filePath: string): ComponentVariant[] {
  try {
    if (!fs.existsSync(filePath)) {
      return []
    }
    
    const content = fs.readFileSync(filePath, 'utf-8')
    const variants: ComponentVariant[] = []
    
    // Find the variants block - look for "variants: {" and extract until matching brace
    const variantsStartMatch = content.match(/variants:\s*\{/)
    if (!variantsStartMatch) {
      return []
    }
    
    const startIndex = variantsStartMatch.index! + variantsStartMatch[0].length
    let braceCount = 1
    let endIndex = startIndex
    
    // Find the matching closing brace
    for (let i = startIndex; i < content.length && braceCount > 0; i++) {
      if (content[i] === '{') braceCount++
      else if (content[i] === '}') braceCount--
      if (braceCount === 0) {
        endIndex = i
        break
      }
    }
    
    const variantsContent = content.substring(startIndex, endIndex)
    
    // Extract each variant property and its options
    const variantMatches = variantsContent.match(/(\w+):\s*\{[^}]*\}/g)
    
    if (variantMatches) {
      for (const match of variantMatches) {
        const variantMatch = match.match(/(\w+):\s*\{([^}]*)\}/)
        if (!variantMatch) continue
        
        const variantName = variantMatch[1]
        const variantContent = variantMatch[2]
        
        // Skip if this is not a valid variant name (avoid things like defaultVariants)
        if (variantName === 'defaultVariants' || variantName === 'compoundVariants') {
          continue
        }
        
        // Extract option names - look for property names at the start of lines
        const options: string[] = []
        const lines = variantContent.split('\n')
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          // Match lines that start with a word followed by colon (but not nested objects)
          const optionMatch = trimmedLine.match(/^(\w+):\s*(?!.*\{)/)
          if (optionMatch) {
            const optionName = optionMatch[1]
            if (optionName && !options.includes(optionName)) {
              options.push(optionName)
            }
          }
        }
        
        if (options.length > 0) {
          variants.push({
            name: variantName,
            description: `${variantName} variant with options: ${options.join(', ')}`,
            props: { [variantName]: options[0] },
            options
          })
        }
      }
    }
    
    return variants
  } catch (error) {
    console.warn(`Failed to extract variants from ${filePath}:`, error)
    return []
  }
}

/**
 * Generates installation commands for different package managers
 */
function generateInstallCommands(packageName: string): { npm: string; yarn: string; pnpm: string } {
  return {
    npm: `npm install ${packageName}`,
    yarn: `yarn add ${packageName}`,
    pnpm: `pnpm add ${packageName}`
  }
}

/**
 * Creates dependency information for a component
 */
function createDependencies(componentId: string, packageJson: Record<string, any>): ComponentDependency[] {
  const dependencies: ComponentDependency[] = []
  
  // Add Radix UI dependency if applicable
  const radixPackage = RADIX_PACKAGE_MAP[componentId]
  if (radixPackage && packageJson.dependencies[radixPackage]) {
    const details = DEPENDENCY_DETAILS[radixPackage]
    const installCommands = generateInstallCommands(radixPackage)
    
    dependencies.push({
      name: radixPackage,
      version: packageJson.dependencies[radixPackage],
      type: 'direct',
      description: details?.description || `Radix UI primitive for ${componentId}`,
      installCommand: installCommands.npm,
      documentationUrl: details?.documentationUrl
    })
  }
  
  // Add external library dependencies
  const externalLibs = EXTERNAL_LIBRARY_MAP[componentId]
  if (externalLibs) {
    for (const lib of externalLibs) {
      if (packageJson.dependencies[lib]) {
        const details = DEPENDENCY_DETAILS[lib]
        const installCommands = generateInstallCommands(lib)
        
        dependencies.push({
          name: lib,
          version: packageJson.dependencies[lib],
          type: 'direct',
          description: details?.description || `External library required for ${componentId}`,
          installCommand: installCommands.npm,
          documentationUrl: details?.documentationUrl
        })
      }
    }
  }
  
  // Add common dependencies that are frequently used
  const commonDeps = ['class-variance-authority', 'clsx', 'tailwind-merge']
  for (const dep of commonDeps) {
    if (packageJson.dependencies[dep]) {
      const details = DEPENDENCY_DETAILS[dep]
      const installCommands = generateInstallCommands(dep)
      
      dependencies.push({
        name: dep,
        version: packageJson.dependencies[dep],
        type: 'direct',
        description: details?.description || `Utility library for ${componentId}`,
        installCommand: installCommands.npm,
        documentationUrl: details?.documentationUrl
      })
    }
  }
  
  return dependencies
}

/**
 * Discovers all components in both original and CSS modules directories
 */
function discoverComponents(): ComponentInfo[] {
  const components: ComponentInfo[] = []
  
  // Read package.json for dependency information
  let packageJson: Record<string, any> = {}
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  } catch (error) {
    console.warn('Failed to read package.json:', error)
  }
  
  // Scan original components
  const originalDir = path.join(process.cwd(), 'src/components/ui')
  const originalComponents = scanComponentDirectory(originalDir, true)
  
  // Scan CSS modules components
  const cssModulesDir = path.join(process.cwd(), 'src/components/shadcss-ui')
  const cssModulesComponents = scanComponentDirectory(cssModulesDir, false)
  
  // Create a set of all unique component names
  const allComponentNames = new Set([...originalComponents, ...cssModulesComponents])
  
  for (const componentName of Array.from(allComponentNames)) {
    const hasOriginal = originalComponents.includes(componentName)
    const hasCssModules = cssModulesComponents.includes(componentName)
    
    // Extract variants from the component file
    let variants: ComponentVariant[] = []
    if (hasOriginal) {
      const originalPath = path.join(originalDir, `${componentName}.tsx`)
      variants = extractVariantsFromFile(originalPath)
    } else if (hasCssModules) {
      const cssModulesPath = path.join(cssModulesDir, componentName, 'index.tsx')
      variants = extractVariantsFromFile(cssModulesPath)
    }
    
    const componentInfo: ComponentInfo = {
      id: componentName,
      name: componentName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: COMPONENT_DESCRIPTIONS[componentName] || `${componentName} component`,
      category: COMPONENT_CATEGORIES[componentName] || 'basic',
      dependencies: createDependencies(componentName, packageJson),
      variants,
      examples: [], // Will be populated later
      hasOriginalVersion: hasOriginal,
      hasCssModulesVersion: hasCssModules,
      radixPackage: RADIX_PACKAGE_MAP[componentName],
      externalLibraries: EXTERNAL_LIBRARY_MAP[componentName],
      originalPath: hasOriginal ? `src/components/ui/${componentName}.tsx` : undefined,
      cssModulesPath: hasCssModules ? `src/components/shadcss-ui/${componentName}/index.tsx` : undefined
    }
    
    components.push(componentInfo)
  }
  
  return components.sort((a, b) => a.name.localeCompare(b.name))
}

export async function GET() {
  try {
    const components = discoverComponents()
    return NextResponse.json({ components })
  } catch (error) {
    console.error('Error discovering components:', error)
    return NextResponse.json(
      { error: 'Failed to discover components' },
      { status: 500 }
    )
  }
}