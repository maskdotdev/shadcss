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
} from './types'
import { discoverComponents } from './component-discovery'
import { getComponentExamples } from './examples'

/**
 * Creates a component registry with all discovered components
 */
export async function createComponentRegistry(): Promise<ComponentRegistry> {
  const components = await discoverComponents()
  
  // Enhance components with examples
  const enhancedComponents = components.map(component => {
    // Get examples for both versions if available
    const examples = []
    
    if (component.hasOriginalVersion) {
      const originalExamples = getComponentExamples(component.id, 'original')
      examples.push(...originalExamples)
    }
    
    if (component.hasCssModulesVersion) {
      const cssModulesExamples = getComponentExamples(component.id, 'css-modules')
      // Only add CSS modules examples if they're different or if original doesn't exist
      if (!component.hasOriginalVersion) {
        examples.push(...cssModulesExamples)
      }
    }
    
    return {
      ...component,
      examples
    }
  })
  
  // Group components by category
  const categories: Record<ComponentCategory, ComponentInfo[]> = {} as Record<ComponentCategory, ComponentInfo[]>
  for (const component of enhancedComponents) {
    if (!categories[component.category]) {
      categories[component.category] = []
    }
    categories[component.category].push(component)
  }
  
  // Create dependency map for quick lookups
  const dependencyMap: Record<string, ComponentDependency> = {}
  for (const component of enhancedComponents) {
    for (const dependency of component.dependencies) {
      dependencyMap[dependency.name] = dependency
    }
  }

  // Generate registry statistics
  const stats = generateRegistryStats(enhancedComponents)
  
  return {
    components: enhancedComponents,
    categories,
    dependencyMap,
    stats,
    lastUpdated: new Date()
  }
}

/**
 * Generates comprehensive statistics for the component registry
 */
function generateRegistryStats(components: ComponentInfo[]): RegistryStats {
  const categoryCounts: Record<ComponentCategory, number> = {
    basic: 0,
    layout: 0,
    feedback: 0,
    navigation: 0,
    data: 0,
    overlay: 0
  }

  const dependencyCounts: Record<string, number> = {}
  let originalOnly = 0
  let cssModulesOnly = 0
  let both = 0

  for (const component of components) {
    // Count by category
    categoryCounts[component.category]++

    // Count version availability
    if (component.hasOriginalVersion && component.hasCssModulesVersion) {
      both++
    } else if (component.hasOriginalVersion) {
      originalOnly++
    } else if (component.hasCssModulesVersion) {
      cssModulesOnly++
    }

    // Count dependencies
    for (const dependency of component.dependencies) {
      dependencyCounts[dependency.name] = (dependencyCounts[dependency.name] || 0) + 1
    }
  }

  return {
    totalComponents: components.length,
    categoryCounts,
    versionCounts: {
      originalOnly,
      cssModulesOnly,
      both
    },
    dependencyCounts
  }
}

/**
 * Gets a component by its ID
 */
export function getComponentById(registry: ComponentRegistry, id: string): ComponentInfo | undefined {
  return registry.components.find(component => component.id === id)
}

/**
 * Gets components by category
 */
export function getComponentsByCategory(registry: ComponentRegistry, category: ComponentCategory): ComponentInfo[] {
  return registry.categories[category] || []
}

/**
 * Advanced search with scoring and field matching
 */
export function searchComponents(registry: ComponentRegistry, options: SearchOptions): SearchResult[] {
  if (!options.query.trim()) {
    return registry.components.map(component => ({
      component,
      matchScore: 1,
      matchedFields: []
    }))
  }
  
  const query = options.caseSensitive ? options.query : options.query.toLowerCase()
  const searchFields = options.fields || ['name', 'description', 'id']
  const results: SearchResult[] = []

  for (const component of registry.components) {
    let matchScore = 0
    const matchedFields: string[] = []

    for (const field of searchFields) {
      const fieldValue = options.caseSensitive 
        ? String(component[field as keyof ComponentInfo]) 
        : String(component[field as keyof ComponentInfo]).toLowerCase()
      
      if (fieldValue.includes(query)) {
        // Higher score for exact matches and matches at the beginning
        const exactMatch = fieldValue === query
        const startsWithMatch = fieldValue.startsWith(query)
        
        if (exactMatch) {
          matchScore += 10
        } else if (startsWithMatch) {
          matchScore += 5
        } else {
          matchScore += 1
        }
        
        matchedFields.push(field)
      }
    }

    if (matchScore > 0) {
      results.push({
        component,
        matchScore,
        matchedFields
      })
    }
  }

  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore)
}

/**
 * Simple search that returns components (backward compatibility)
 */
export function searchComponentsSimple(registry: ComponentRegistry, query: string): ComponentInfo[] {
  const results = searchComponents(registry, { query })
  return results.map(result => result.component)
}

/**
 * Enhanced filtering with new FilterOptions interface
 */
export function filterComponents(registry: ComponentRegistry, filters: FilterOptions): ComponentInfo[] {
  return registry.components.filter(component => {
    if (filters.category && component.category !== filters.category) {
      return false
    }
    
    if (filters.hasOriginalVersion !== undefined && component.hasOriginalVersion !== filters.hasOriginalVersion) {
      return false
    }
    
    if (filters.hasCssModulesVersion !== undefined && component.hasCssModulesVersion !== filters.hasCssModulesVersion) {
      return false
    }
    
    if (filters.radixPackage && component.radixPackage !== filters.radixPackage) {
      return false
    }
    
    if (filters.externalLibrary && (!component.externalLibraries || !component.externalLibraries.includes(filters.externalLibrary))) {
      return false
    }

    if (filters.searchQuery) {
      const searchResults = searchComponents(registry, { query: filters.searchQuery })
      return searchResults.some(result => result.component.id === component.id)
    }
    
    return true
  })
}

/**
 * Apply custom filter function
 */
export function applyCustomFilter(registry: ComponentRegistry, filter: ComponentFilter): ComponentInfo[] {
  return registry.components.filter(filter)
}

/**
 * Sort components using custom sorter
 */
export function sortComponents(components: ComponentInfo[], sorter: ComponentSorter): ComponentInfo[] {
  return [...components].sort(sorter)
}

/**
 * Gets all unique categories with enhanced information
 */
export function getCategories(registry: ComponentRegistry): ComponentCategory[] {
  return Object.keys(registry.categories).sort() as ComponentCategory[]
}

/**
 * Gets category information with component counts
 */
export function getCategoryInfo(registry: ComponentRegistry): Record<ComponentCategory, { name: string; count: number; description: string }> {
  const categoryDescriptions: Record<ComponentCategory, { name: string; description: string }> = {
    basic: { name: 'Basic', description: 'Fundamental UI elements like buttons, inputs, and labels' },
    layout: { name: 'Layout', description: 'Components for structuring and organizing content' },
    feedback: { name: 'Feedback', description: 'Components for user feedback like alerts and progress indicators' },
    navigation: { name: 'Navigation', description: 'Components for navigation and routing' },
    data: { name: 'Data', description: 'Components for displaying and manipulating data' },
    overlay: { name: 'Overlay', description: 'Modal dialogs, popovers, and overlay components' }
  }

  const result: Record<ComponentCategory, { name: string; count: number; description: string }> = {} as Record<ComponentCategory, { name: string; count: number; description: string }>

  for (const category of Object.keys(registry.categories) as ComponentCategory[]) {
    result[category] = {
      name: categoryDescriptions[category].name,
      description: categoryDescriptions[category].description,
      count: registry.categories[category].length
    }
  }

  return result
}

/**
 * Gets all unique Radix packages
 */
export function getRadixPackages(registry: ComponentRegistry): string[] {
  const packages = new Set<string>()
  
  for (const component of registry.components) {
    if (component.radixPackage) {
      packages.add(component.radixPackage)
    }
  }
  
  return Array.from(packages).sort()
}

/**
 * Gets all unique external libraries
 */
export function getExternalLibraries(registry: ComponentRegistry): string[] {
  const libraries = new Set<string>()
  
  for (const component of registry.components) {
    if (component.externalLibraries) {
      for (const lib of component.externalLibraries) {
        libraries.add(lib)
      }
    }
  }
  
  return Array.from(libraries).sort()
}

/**
 * Gets component statistics
 */
export function getComponentStats(registry: ComponentRegistry) {
  const stats = {
    total: registry.components.length,
    withOriginalVersion: 0,
    withCssModulesVersion: 0,
    withBothVersions: 0,
    byCategory: {} as Record<string, number>,
    withRadixUI: 0,
    withExternalLibraries: 0
  }
  
  for (const component of registry.components) {
    if (component.hasOriginalVersion) {
      stats.withOriginalVersion++
    }
    
    if (component.hasCssModulesVersion) {
      stats.withCssModulesVersion++
    }
    
    if (component.hasOriginalVersion && component.hasCssModulesVersion) {
      stats.withBothVersions++
    }
    
    stats.byCategory[component.category] = (stats.byCategory[component.category] || 0) + 1
    
    if (component.radixPackage) {
      stats.withRadixUI++
    }
    
    if (component.externalLibraries && component.externalLibraries.length > 0) {
      stats.withExternalLibraries++
    }
  }
  
  return stats
}

/**
 * Common component sorters
 */
export const ComponentSorters = {
  alphabetical: (a: ComponentInfo, b: ComponentInfo) => a.name.localeCompare(b.name),
  reverseAlphabetical: (a: ComponentInfo, b: ComponentInfo) => b.name.localeCompare(a.name),
  byCategory: (a: ComponentInfo, b: ComponentInfo) => {
    const categoryOrder: ComponentCategory[] = ['basic', 'layout', 'feedback', 'navigation', 'data', 'overlay']
    const aIndex = categoryOrder.indexOf(a.category)
    const bIndex = categoryOrder.indexOf(b.category)
    if (aIndex !== bIndex) {
      return aIndex - bIndex
    }
    return a.name.localeCompare(b.name)
  },
  byDependencyCount: (a: ComponentInfo, b: ComponentInfo) => b.dependencies.length - a.dependencies.length,
  byVersionAvailability: (a: ComponentInfo, b: ComponentInfo) => {
    const aScore = (a.hasOriginalVersion ? 1 : 0) + (a.hasCssModulesVersion ? 1 : 0)
    const bScore = (b.hasOriginalVersion ? 1 : 0) + (b.hasCssModulesVersion ? 1 : 0)
    return bScore - aScore
  }
}

/**
 * Common component filters
 */
export const ComponentFilters = {
  hasOriginalVersion: (component: ComponentInfo) => component.hasOriginalVersion,
  hasCssModulesVersion: (component: ComponentInfo) => component.hasCssModulesVersion,
  hasBothVersions: (component: ComponentInfo) => component.hasOriginalVersion && component.hasCssModulesVersion,
  hasRadixUI: (component: ComponentInfo) => !!component.radixPackage,
  hasExternalLibraries: (component: ComponentInfo) => !!(component.externalLibraries && component.externalLibraries.length > 0),
  byCategory: (category: ComponentCategory) => (component: ComponentInfo) => component.category === category,
  byRadixPackage: (packageName: string) => (component: ComponentInfo) => component.radixPackage === packageName,
  byExternalLibrary: (libraryName: string) => (component: ComponentInfo) => 
    !!(component.externalLibraries && component.externalLibraries.includes(libraryName))
}

/**
 * Combines multiple filters with AND logic
 */
export function combineFilters(...filters: ComponentFilter[]): ComponentFilter {
  return (component: ComponentInfo) => filters.every(filter => filter(component))
}

/**
 * Combines multiple filters with OR logic
 */
export function combineFiltersOr(...filters: ComponentFilter[]): ComponentFilter {
  return (component: ComponentInfo) => filters.some(filter => filter(component))
}

/**
 * Gets components that match all provided criteria
 */
export function getComponentsMatching(
  registry: ComponentRegistry,
  criteria: {
    categories?: ComponentCategory[]
    hasOriginalVersion?: boolean
    hasCssModulesVersion?: boolean
    radixPackages?: string[]
    externalLibraries?: string[]
    searchQuery?: string
  }
): ComponentInfo[] {
  const filters: ComponentFilter[] = []

  if (criteria.categories && criteria.categories.length > 0) {
    filters.push(component => criteria.categories!.includes(component.category))
  }

  if (criteria.hasOriginalVersion !== undefined) {
    filters.push(component => component.hasOriginalVersion === criteria.hasOriginalVersion)
  }

  if (criteria.hasCssModulesVersion !== undefined) {
    filters.push(component => component.hasCssModulesVersion === criteria.hasCssModulesVersion)
  }

  if (criteria.radixPackages && criteria.radixPackages.length > 0) {
    filters.push(component => !!(component.radixPackage && criteria.radixPackages!.includes(component.radixPackage)))
  }

  if (criteria.externalLibraries && criteria.externalLibraries.length > 0) {
    filters.push(component => !!(
      component.externalLibraries && 
      component.externalLibraries.some(lib => criteria.externalLibraries!.includes(lib))
    ))
  }

  let components = registry.components

  if (filters.length > 0) {
    const combinedFilter = combineFilters(...filters)
    components = components.filter(combinedFilter)
  }

  if (criteria.searchQuery) {
    const searchResults = searchComponents(registry, { query: criteria.searchQuery })
    const searchComponentIds = new Set(searchResults.map(result => result.component.id))
    components = components.filter(component => searchComponentIds.has(component.id))
  }

  return components
}

/**
 * Refreshes the component registry by re-discovering components
 */
export async function refreshComponentRegistry(): Promise<ComponentRegistry> {
  return await createComponentRegistry()
}

// Create and export the default registry (this will be a Promise)
export const componentRegistry = createComponentRegistry()