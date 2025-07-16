/**
 * Test-specific component registry that doesn't import React components
 * This allows us to test the core logic without CSS/React dependencies
 */

import { 
  ComponentInfo, 
  ComponentRegistry, 
  ComponentDependency, 
  ComponentCategory,
  RegistryStats,
  FilterOptions,
  SearchResult,
  SearchOptions,
  ComponentFilter,
  ComponentSorter,
  ComponentVersion
} from '../types'

// Mock component data for testing
const mockComponents: ComponentInfo[] = [
  {
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
    examples: [
      {
        title: 'Basic Usage',
        description: 'Simple button with different variants',
        code: `<Button variant="default">Default</Button>`,
        component: null as any
      }
    ],
    hasOriginalVersion: true,
    hasCssModulesVersion: true,
    radixPackage: '@radix-ui/react-slot'
  },
  {
    id: 'card',
    name: 'Card',
    description: 'A flexible container component for displaying content',
    category: 'layout',
    dependencies: [],
    variants: [],
    examples: [
      {
        title: 'Basic Card',
        description: 'Simple card with header and content',
        code: `<Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>`,
        component: null as any
      }
    ],
    hasOriginalVersion: true,
    hasCssModulesVersion: true
  },
  {
    id: 'input',
    name: 'Input',
    description: 'A text input field component',
    category: 'basic',
    dependencies: [],
    variants: [
      { name: 'default', description: 'Default input style', props: {} },
      { name: 'file', description: 'File input', props: { type: 'file' } }
    ],
    examples: [
      {
        title: 'Basic Input',
        description: 'Simple text input',
        code: `<Input placeholder="Enter text..." />`,
        component: null as any
      }
    ],
    hasOriginalVersion: true,
    hasCssModulesVersion: true
  },
  {
    id: 'dialog',
    name: 'Dialog',
    description: 'A modal dialog component',
    category: 'overlay',
    dependencies: [
      {
        name: '@radix-ui/react-dialog',
        version: '^1.1.14',
        type: 'direct',
        description: 'Radix UI Dialog primitive',
        installCommand: 'npm install @radix-ui/react-dialog',
        documentationUrl: 'https://radix-ui.com/primitives/docs/components/dialog'
      }
    ],
    variants: [],
    examples: [
      {
        title: 'Basic Dialog',
        description: 'Simple modal dialog',
        code: `<Dialog><DialogTrigger>Open</DialogTrigger><DialogContent>Content</DialogContent></Dialog>`,
        component: null as any
      }
    ],
    hasOriginalVersion: true,
    hasCssModulesVersion: true,
    radixPackage: '@radix-ui/react-dialog'
  },
  {
    id: 'select',
    name: 'Select',
    description: 'A dropdown select component',
    category: 'basic',
    dependencies: [
      {
        name: '@radix-ui/react-select',
        version: '^2.2.5',
        type: 'direct',
        description: 'Radix UI Select primitive',
        installCommand: 'npm install @radix-ui/react-select',
        documentationUrl: 'https://radix-ui.com/primitives/docs/components/select'
      }
    ],
    variants: [],
    examples: [
      {
        title: 'Basic Select',
        description: 'Simple dropdown select',
        code: `<Select><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Option 1</SelectItem></SelectContent></Select>`,
        component: null as any
      }
    ],
    hasOriginalVersion: true,
    hasCssModulesVersion: false,
    radixPackage: '@radix-ui/react-select'
  }
]

/**
 * Creates a test component registry with mock data
 */
export async function createTestComponentRegistry(): Promise<ComponentRegistry> {
  const categories: Record<ComponentCategory, ComponentInfo[]> = {
    basic: mockComponents.filter(c => c.category === 'basic'),
    layout: mockComponents.filter(c => c.category === 'layout'),
    feedback: mockComponents.filter(c => c.category === 'feedback'),
    navigation: mockComponents.filter(c => c.category === 'navigation'),
    data: mockComponents.filter(c => c.category === 'data'),
    overlay: mockComponents.filter(c => c.category === 'overlay')
  }

  const dependencyMap: Record<string, ComponentDependency> = {}
  mockComponents.forEach(component => {
    component.dependencies.forEach(dep => {
      dependencyMap[dep.name] = dep
    })
  })

  const stats: RegistryStats = {
    total: mockComponents.length,
    withOriginalVersion: mockComponents.filter(c => c.hasOriginalVersion).length,
    withCssModulesVersion: mockComponents.filter(c => c.hasCssModulesVersion).length,
    withBothVersions: mockComponents.filter(c => c.hasOriginalVersion && c.hasCssModulesVersion).length,
    withRadixUI: mockComponents.filter(c => c.radixPackage).length,
    withExternalLibraries: mockComponents.filter(c => c.externalLibraries && c.externalLibraries.length > 0).length,
    byCategory: Object.fromEntries(
      Object.entries(categories).map(([category, components]) => [category, components.length])
    ) as Record<ComponentCategory, number>
  }

  return {
    components: mockComponents,
    categories,
    dependencyMap,
    stats,
    lastUpdated: new Date()
  }
}

/**
 * Get component by ID
 */
export function getComponentById(registry: ComponentRegistry, id: string): ComponentInfo | null {
  return registry.components.find(component => component.id === id) || null
}

/**
 * Search components by query
 */
export function searchComponents(registry: ComponentRegistry, query: string, options?: SearchOptions): ComponentInfo[] {
  if (!query.trim()) {
    return registry.components
  }

  const lowerQuery = query.toLowerCase()
  
  return registry.components.filter(component => {
    const nameMatch = component.name.toLowerCase().includes(lowerQuery)
    const descriptionMatch = component.description.toLowerCase().includes(lowerQuery)
    const categoryMatch = component.category.toLowerCase().includes(lowerQuery)
    
    return nameMatch || descriptionMatch || categoryMatch
  })
}

/**
 * Filter components by criteria
 */
export function filterComponents(registry: ComponentRegistry, filter: FilterOptions): ComponentInfo[] {
  let filtered = registry.components

  if (filter.category) {
    filtered = filtered.filter(component => component.category === filter.category)
  }

  if (filter.library) {
    if (filter.library === 'radix') {
      filtered = filtered.filter(component => 
        component.dependencies.some(dep => dep.name.includes('@radix-ui'))
      )
    } else {
      filtered = filtered.filter(component => 
        component.dependencies.some(dep => dep.name.includes(filter.library!)) ||
        component.externalLibraries?.includes(filter.library!)
      )
    }
  }

  if (filter.hasOriginalVersion !== undefined) {
    filtered = filtered.filter(component => component.hasOriginalVersion === filter.hasOriginalVersion)
  }

  if (filter.hasCssModulesVersion !== undefined) {
    filtered = filtered.filter(component => component.hasCssModulesVersion === filter.hasCssModulesVersion)
  }

  return filtered
}

/**
 * Get component statistics
 */
export function getComponentStats(registry: ComponentRegistry): RegistryStats {
  return registry.stats
}