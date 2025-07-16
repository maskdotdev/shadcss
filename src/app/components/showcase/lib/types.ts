export interface ComponentDependency {
  name: string
  version: string
  type: 'peer' | 'direct'
  description: string
  installCommand: string
  documentationUrl?: string
}

export interface ComponentVariant {
  name: string
  description: string
  props: Record<string, unknown>
  options?: string[]
}

export interface ComponentExample {
  title: string
  description: string
  code: string
  component?: React.ComponentType
  variants?: ComponentVariant[]
}

export interface ComponentInfo {
  id: string
  name: string
  description: string
  category: ComponentCategory
  dependencies: ComponentDependency[]
  variants: ComponentVariant[]
  examples: ComponentExample[]
  hasOriginalVersion: boolean
  hasCssModulesVersion: boolean
  radixPackage?: string
  externalLibraries?: string[]
  originalPath?: string
  cssModulesPath?: string
}

export type ComponentVersion = 'original' | 'css-modules'

// Utility types for component categorization and filtering
export type ComponentCategory = 'basic' | 'layout' | 'feedback' | 'navigation' | 'data' | 'overlay'

export interface CategoryInfo {
  id: ComponentCategory
  name: string
  description: string
  componentCount: number
}

export interface FilterOptions {
  category?: ComponentCategory | null
  hasOriginalVersion?: boolean
  hasCssModulesVersion?: boolean
  radixPackage?: string
  externalLibrary?: string
  searchQuery?: string
}

export interface SearchResult {
  component: ComponentInfo
  matchScore: number
  matchedFields: string[]
}

export interface RegistryStats {
  totalComponents: number
  categoryCounts: Record<ComponentCategory, number>
  versionCounts: {
    originalOnly: number
    cssModulesOnly: number
    both: number
  }
  dependencyCounts: Record<string, number>
}

// Enhanced component registry data structure
export interface ComponentRegistry {
  components: ComponentInfo[]
  categories: Record<ComponentCategory, ComponentInfo[]>
  dependencyMap: Record<string, ComponentDependency>
  stats: RegistryStats
  lastUpdated: Date
}

// Utility types for component discovery and metadata extraction
export interface ComponentFileInfo {
  path: string
  name: string
  isOriginal: boolean
  isCssModules: boolean
  category?: ComponentCategory
}

export interface DependencyAnalysis {
  radixPackages: string[]
  externalLibraries: string[]
  peerDependencies: string[]
  directDependencies: string[]
}

// Type guards and utility functions
export type ComponentFilter = (component: ComponentInfo) => boolean
export type ComponentSorter = (a: ComponentInfo, b: ComponentInfo) => number

// Search and filtering utilities
export interface SearchOptions {
  query: string
  fields?: (keyof ComponentInfo)[]
  caseSensitive?: boolean
  fuzzy?: boolean
}

export interface AdvancedSearchOptions extends SearchOptions {
  includeCategories?: boolean
  includeDependencies?: boolean
  includeExamples?: boolean
  maxResults?: number
  minScore?: number
}

export interface SearchSuggestion {
  text: string
  type: 'component' | 'category' | 'dependency' | 'recent'
  score: number
  metadata?: {
    componentId?: string
    category?: string
    dependency?: string
  }
}

export interface SearchHistory {
  query: string
  timestamp: number
  resultCount: number
}

export interface FilterState {
  category: ComponentCategory | null
  version: ComponentVersion | 'both' | null
  dependency: string | null
  searchQuery: string
}