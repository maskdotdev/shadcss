import { ComponentInfo, ComponentRegistry, ComponentCategory, FilterOptions, ComponentVersion } from './types'
import { performanceMonitor, PerformanceCache } from './performance-monitor'

export interface FilterCriteria {
  searchQuery?: string
  category?: ComponentCategory | null
  version?: ComponentVersion | 'both' | null
  dependency?: string | null
  radixPackage?: string | null
  externalLibrary?: string | null
  hasOriginalVersion?: boolean
  hasCssModulesVersion?: boolean
}

export interface FilterState extends FilterCriteria {
  sortBy?: SortOption
  sortOrder?: 'asc' | 'desc'
}

export type SortOption = 'name' | 'category' | 'dependencies' | 'versions'

export interface FilterResult {
  components: ComponentInfo[]
  totalCount: number
  filteredCount: number
  appliedFilters: string[]
  availableFilters: AvailableFilters
}

export interface AvailableFilters {
  categories: Array<{ value: ComponentCategory; label: string; count: number }>
  dependencies: Array<{ value: string; label: string; count: number }>
  radixPackages: Array<{ value: string; label: string; count: number }>
  externalLibraries: Array<{ value: string; label: string; count: number }>
  versions: Array<{ value: string; label: string; count: number }>
}

/**
 * Efficient filtering system with caching and URL persistence
 */
export class FilteringSystem {
  private cache = new Map<string, FilterResult>()
  private readonly maxCacheSize = 100

  constructor(private registry: ComponentRegistry) {}

  /**
   * Applies filters to components with caching
   */
  filter(criteria: FilterCriteria): FilterResult {
    return performanceMonitor.measure('filter-components', () => {
      const cacheKey = this.getCacheKey(criteria)
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!
      }

      // Apply filters
      let components = [...this.registry.components]
      const appliedFilters: string[] = []

      // Search filter
      if (criteria.searchQuery?.trim()) {
        components = this.applySearchFilter(components, criteria.searchQuery)
        appliedFilters.push(`Search: "${criteria.searchQuery}"`)
      }

      // Category filter
      if (criteria.category) {
        components = components.filter(c => c.category === criteria.category)
        appliedFilters.push(`Category: ${this.getCategoryLabel(criteria.category)}`)
      }

      // Version filter
      if (criteria.version && criteria.version !== 'both') {
        if (criteria.version === 'original') {
          components = components.filter(c => c.hasOriginalVersion)
          appliedFilters.push('Version: Original only')
        } else if (criteria.version === 'css-modules') {
          components = components.filter(c => c.hasCssModulesVersion)
          appliedFilters.push('Version: CSS Modules only')
        }
      }

      // Specific version availability filters
      if (criteria.hasOriginalVersion !== undefined) {
        components = components.filter(c => c.hasOriginalVersion === criteria.hasOriginalVersion)
        appliedFilters.push(`Original version: ${criteria.hasOriginalVersion ? 'Required' : 'Not required'}`)
      }

      if (criteria.hasCssModulesVersion !== undefined) {
        components = components.filter(c => c.hasCssModulesVersion === criteria.hasCssModulesVersion)
        appliedFilters.push(`CSS Modules version: ${criteria.hasCssModulesVersion ? 'Required' : 'Not required'}`)
      }

      // Dependency filter
      if (criteria.dependency) {
        components = components.filter(c => 
          c.dependencies.some(dep => dep.name === criteria.dependency) ||
          c.radixPackage === criteria.dependency ||
          (c.externalLibraries && c.externalLibraries.includes(criteria.dependency))
        )
        appliedFilters.push(`Dependency: ${criteria.dependency}`)
      }

      // Radix package filter
      if (criteria.radixPackage) {
        components = components.filter(c => c.radixPackage === criteria.radixPackage)
        appliedFilters.push(`Radix UI: ${criteria.radixPackage}`)
      }

      // External library filter
      if (criteria.externalLibrary) {
        components = components.filter(c => 
          c.externalLibraries && c.externalLibraries.includes(criteria.externalLibrary)
        )
        appliedFilters.push(`External Library: ${criteria.externalLibrary}`)
      }

      // Generate available filters based on current results
      const availableFilters = this.generateAvailableFilters(components)

      const result: FilterResult = {
        components,
        totalCount: this.registry.components.length,
        filteredCount: components.length,
        appliedFilters,
        availableFilters
      }

      // Cache result
      this.cacheResult(cacheKey, result)

      return result
    }, { 
      searchQuery: criteria.searchQuery, 
      category: criteria.category,
      componentCount: this.registry.components.length 
    })
  }

  /**
   * Applies search filter using simple text matching
   */
  private applySearchFilter(components: ComponentInfo[], query: string): ComponentInfo[] {
    const queryLower = query.toLowerCase()
    
    return components.filter(component => {
      // Search in name
      if (component.name.toLowerCase().includes(queryLower)) return true
      
      // Search in description
      if (component.description.toLowerCase().includes(queryLower)) return true
      
      // Search in category
      if (component.category.toLowerCase().includes(queryLower)) return true
      
      // Search in dependencies
      if (component.dependencies.some(dep => dep.name.toLowerCase().includes(queryLower))) return true
      
      // Search in Radix package
      if (component.radixPackage?.toLowerCase().includes(queryLower)) return true
      
      // Search in external libraries
      if (component.externalLibraries?.some(lib => lib.toLowerCase().includes(queryLower))) return true
      
      return false
    })
  }

  /**
   * Sorts filtered components
   */
  sort(components: ComponentInfo[], sortBy: SortOption, sortOrder: 'asc' | 'desc' = 'asc'): ComponentInfo[] {
    const sorted = [...components].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case 'dependencies':
          comparison = b.dependencies.length - a.dependencies.length
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
        case 'versions':
          const aVersions = (a.hasOriginalVersion ? 1 : 0) + (a.hasCssModulesVersion ? 1 : 0)
          const bVersions = (b.hasOriginalVersion ? 1 : 0) + (b.hasCssModulesVersion ? 1 : 0)
          comparison = bVersions - aVersions
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name)
          }
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return sorted
  }

  /**
   * Generates available filter options based on current component set
   */
  private generateAvailableFilters(components: ComponentInfo[]): AvailableFilters {
    const categoryCounts = new Map<ComponentCategory, number>()
    const dependencyCounts = new Map<string, number>()
    const radixPackageCounts = new Map<string, number>()
    const externalLibraryCounts = new Map<string, number>()
    const versionCounts = {
      'original-only': 0,
      'css-modules-only': 0,
      'both': 0
    }

    for (const component of components) {
      // Count categories
      categoryCounts.set(component.category, (categoryCounts.get(component.category) || 0) + 1)

      // Count dependencies
      for (const dep of component.dependencies) {
        dependencyCounts.set(dep.name, (dependencyCounts.get(dep.name) || 0) + 1)
      }

      // Count Radix packages
      if (component.radixPackage) {
        radixPackageCounts.set(component.radixPackage, (radixPackageCounts.get(component.radixPackage) || 0) + 1)
      }

      // Count external libraries
      if (component.externalLibraries) {
        for (const lib of component.externalLibraries) {
          externalLibraryCounts.set(lib, (externalLibraryCounts.get(lib) || 0) + 1)
        }
      }

      // Count versions
      if (component.hasOriginalVersion && component.hasCssModulesVersion) {
        versionCounts.both++
      } else if (component.hasOriginalVersion) {
        versionCounts['original-only']++
      } else if (component.hasCssModulesVersion) {
        versionCounts['css-modules-only']++
      }
    }

    return {
      categories: Array.from(categoryCounts.entries())
        .map(([category, count]) => ({
          value: category,
          label: this.getCategoryLabel(category),
          count
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),

      dependencies: Array.from(dependencyCounts.entries())
        .map(([dep, count]) => ({
          value: dep,
          label: this.getDependencyLabel(dep),
          count
        }))
        .sort((a, b) => b.count - a.count),

      radixPackages: Array.from(radixPackageCounts.entries())
        .map(([pkg, count]) => ({
          value: pkg,
          label: this.getRadixPackageLabel(pkg),
          count
        }))
        .sort((a, b) => b.count - a.count),

      externalLibraries: Array.from(externalLibraryCounts.entries())
        .map(([lib, count]) => ({
          value: lib,
          label: lib,
          count
        }))
        .sort((a, b) => b.count - a.count),

      versions: [
        { value: 'both', label: 'Both versions', count: versionCounts.both },
        { value: 'original-only', label: 'Original only', count: versionCounts['original-only'] },
        { value: 'css-modules-only', label: 'CSS Modules only', count: versionCounts['css-modules-only'] }
      ].filter(v => v.count > 0)
    }
  }

  /**
   * Gets human-readable category label
   */
  private getCategoryLabel(category: ComponentCategory): string {
    const labels: Record<ComponentCategory, string> = {
      basic: 'Basic',
      layout: 'Layout',
      feedback: 'Feedback',
      navigation: 'Navigation',
      data: 'Data',
      overlay: 'Overlay'
    }
    return labels[category] || category
  }

  /**
   * Gets human-readable dependency label
   */
  private getDependencyLabel(dependency: string): string {
    // Clean up common package names for display
    if (dependency.startsWith('@radix-ui/')) {
      return dependency.replace('@radix-ui/', 'Radix UI ')
    }
    return dependency
  }

  /**
   * Gets human-readable Radix package label
   */
  private getRadixPackageLabel(packageName: string): string {
    return packageName.replace('@radix-ui/', 'Radix UI ')
  }

  /**
   * Generates cache key for filter criteria
   */
  private getCacheKey(criteria: FilterCriteria): string {
    return JSON.stringify(criteria)
  }

  /**
   * Caches filter result with size limit
   */
  private cacheResult(key: string, result: FilterResult): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, result)
  }

  /**
   * Clears the filter cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Updates the registry and clears cache
   */
  updateRegistry(registry: ComponentRegistry): void {
    this.registry = registry
    this.clearCache()
  }
}

/**
 * URL state management for filters
 */
export class FilterUrlManager {
  private readonly baseUrl: string

  constructor(baseUrl = '/components/showcase') {
    this.baseUrl = baseUrl
  }

  /**
   * Converts filter state to URL search params
   */
  stateToUrl(state: FilterState): string {
    const params = new URLSearchParams()

    if (state.searchQuery?.trim()) {
      params.set('q', state.searchQuery)
    }

    if (state.category) {
      params.set('category', state.category)
    }

    if (state.version && state.version !== 'both') {
      params.set('version', state.version)
    }

    if (state.dependency) {
      params.set('dependency', state.dependency)
    }

    if (state.radixPackage) {
      params.set('radix', state.radixPackage)
    }

    if (state.externalLibrary) {
      params.set('library', state.externalLibrary)
    }

    if (state.hasOriginalVersion !== undefined) {
      params.set('hasOriginal', state.hasOriginalVersion.toString())
    }

    if (state.hasCssModulesVersion !== undefined) {
      params.set('hasCssModules', state.hasCssModulesVersion.toString())
    }

    if (state.sortBy && state.sortBy !== 'name') {
      params.set('sort', state.sortBy)
    }

    if (state.sortOrder && state.sortOrder !== 'asc') {
      params.set('order', state.sortOrder)
    }

    const queryString = params.toString()
    return queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl
  }

  /**
   * Converts URL search params to filter state
   */
  urlToState(searchParams: URLSearchParams): FilterState {
    const state: FilterState = {}

    const searchQuery = searchParams.get('q')
    if (searchQuery) {
      state.searchQuery = searchQuery
    }

    const category = searchParams.get('category') as ComponentCategory
    if (category && this.isValidCategory(category)) {
      state.category = category
    }

    const version = searchParams.get('version')
    if (version && this.isValidVersion(version)) {
      state.version = version as ComponentVersion | 'both'
    }

    const dependency = searchParams.get('dependency')
    if (dependency) {
      state.dependency = dependency
    }

    const radixPackage = searchParams.get('radix')
    if (radixPackage) {
      state.radixPackage = radixPackage
    }

    const externalLibrary = searchParams.get('library')
    if (externalLibrary) {
      state.externalLibrary = externalLibrary
    }

    const hasOriginal = searchParams.get('hasOriginal')
    if (hasOriginal === 'true' || hasOriginal === 'false') {
      state.hasOriginalVersion = hasOriginal === 'true'
    }

    const hasCssModules = searchParams.get('hasCssModules')
    if (hasCssModules === 'true' || hasCssModules === 'false') {
      state.hasCssModulesVersion = hasCssModules === 'true'
    }

    const sortBy = searchParams.get('sort') as SortOption
    if (sortBy && this.isValidSortOption(sortBy)) {
      state.sortBy = sortBy
    }

    const sortOrder = searchParams.get('order')
    if (sortOrder === 'asc' || sortOrder === 'desc') {
      state.sortOrder = sortOrder
    }

    return state
  }

  /**
   * Updates the browser URL without navigation
   */
  updateUrl(state: FilterState, replace = false): void {
    const url = this.stateToUrl(state)
    
    if (replace) {
      window.history.replaceState(null, '', url)
    } else {
      window.history.pushState(null, '', url)
    }
  }

  /**
   * Gets current filter state from URL
   */
  getCurrentState(): FilterState {
    const searchParams = new URLSearchParams(window.location.search)
    return this.urlToState(searchParams)
  }

  private isValidCategory(category: string): category is ComponentCategory {
    return ['basic', 'layout', 'feedback', 'navigation', 'data', 'overlay'].includes(category)
  }

  private isValidVersion(version: string): boolean {
    return ['original', 'css-modules', 'both'].includes(version)
  }

  private isValidSortOption(sort: string): sort is SortOption {
    return ['name', 'category', 'dependencies', 'versions'].includes(sort)
  }
}

/**
 * React hook for managing filter state with URL persistence
 */
export function useFilterState(initialState: FilterState = {}) {
  const [state, setState] = React.useState<FilterState>(initialState)
  const urlManager = React.useRef(new FilterUrlManager())

  // Load initial state from URL
  React.useEffect(() => {
    const urlState = urlManager.current.getCurrentState()
    setState(prevState => ({ ...prevState, ...urlState }))
  }, [])

  // Update URL when state changes
  React.useEffect(() => {
    urlManager.current.updateUrl(state, true)
  }, [state])

  const updateState = React.useCallback((updates: Partial<FilterState>) => {
    setState(prevState => ({ ...prevState, ...updates }))
  }, [])

  const resetState = React.useCallback(() => {
    setState({})
  }, [])

  return {
    state,
    updateState,
    resetState,
    urlManager: urlManager.current
  }
}

// Re-export React for the hook
import React from 'react'