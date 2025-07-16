import { ComponentInfo, ComponentRegistry, SearchResult, SearchOptions } from './types'
import { performanceMonitor, PerformanceCache } from './performance-monitor'

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

export interface SearchIndex {
  components: Map<string, ComponentInfo>
  nameIndex: Map<string, string[]>
  descriptionIndex: Map<string, string[]>
  categoryIndex: Map<string, string[]>
  dependencyIndex: Map<string, string[]>
  keywords: Set<string>
}

/**
 * Advanced search engine with indexing, ranking, and suggestions
 */
export class AdvancedSearchEngine {
  private index: SearchIndex
  private searchHistory: SearchHistory[] = []
  private readonly maxHistorySize = 50
  private searchCache = new PerformanceCache<string, SearchResult[]>(50, 2 * 60 * 1000) // 2 minute TTL

  constructor(private registry: ComponentRegistry) {
    this.index = performanceMonitor.measure('search-index-build', () => this.buildSearchIndex())
    this.loadSearchHistory()
  }

  /**
   * Builds a comprehensive search index for fast lookups
   */
  private buildSearchIndex(): SearchIndex {
    const index: SearchIndex = {
      components: new Map(),
      nameIndex: new Map(),
      descriptionIndex: new Map(),
      categoryIndex: new Map(),
      dependencyIndex: new Map(),
      keywords: new Set()
    }

    for (const component of this.registry.components) {
      // Store component reference
      index.components.set(component.id, component)

      // Index component name
      const nameTokens = this.tokenize(component.name)
      for (const token of nameTokens) {
        if (!index.nameIndex.has(token)) {
          index.nameIndex.set(token, [])
        }
        index.nameIndex.get(token)!.push(component.id)
        index.keywords.add(token)
      }

      // Index description
      const descTokens = this.tokenize(component.description)
      for (const token of descTokens) {
        if (!index.descriptionIndex.has(token)) {
          index.descriptionIndex.set(token, [])
        }
        index.descriptionIndex.get(token)!.push(component.id)
        index.keywords.add(token)
      }

      // Index category
      const categoryTokens = this.tokenize(component.category)
      for (const token of categoryTokens) {
        if (!index.categoryIndex.has(token)) {
          index.categoryIndex.set(token, [])
        }
        index.categoryIndex.get(token)!.push(component.id)
        index.keywords.add(token)
      }

      // Index dependencies
      for (const dep of component.dependencies) {
        const depTokens = this.tokenize(dep.name)
        for (const token of depTokens) {
          if (!index.dependencyIndex.has(token)) {
            index.dependencyIndex.set(token, [])
          }
          index.dependencyIndex.get(token)!.push(component.id)
          index.keywords.add(token)
        }
      }

      // Index external libraries
      if (component.externalLibraries) {
        for (const lib of component.externalLibraries) {
          const libTokens = this.tokenize(lib)
          for (const token of libTokens) {
            if (!index.dependencyIndex.has(token)) {
              index.dependencyIndex.set(token, [])
            }
            index.dependencyIndex.get(token)!.push(component.id)
            index.keywords.add(token)
          }
        }
      }

      // Index Radix package
      if (component.radixPackage) {
        const radixTokens = this.tokenize(component.radixPackage)
        for (const token of radixTokens) {
          if (!index.dependencyIndex.has(token)) {
            index.dependencyIndex.set(token, [])
          }
          index.dependencyIndex.get(token)!.push(component.id)
          index.keywords.add(token)
        }
      }
    }

    return index
  }

  /**
   * Tokenizes text for indexing and searching
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0)
  }

  /**
   * Performs advanced search with ranking and relevance scoring
   */
  search(query: string, options: AdvancedSearchOptions = {}): SearchResult[] {
    return performanceMonitor.measure('advanced-search', () => {
      if (!query.trim()) {
        return this.registry.components.map(component => ({
          component,
          matchScore: 1,
          matchedFields: []
        }))
      }

      // Check cache first
      const cacheKey = `${query}:${JSON.stringify(options)}`
      const cachedResult = this.searchCache.get(cacheKey)
      if (cachedResult) {
        return cachedResult
      }

      const tokens = this.tokenize(query)
      const componentScores = new Map<string, { score: number; fields: Set<string> }>()

      // Search in different fields with different weights
      this.searchInField(tokens, this.index.nameIndex, componentScores, 'name', 10)
      this.searchInField(tokens, this.index.descriptionIndex, componentScores, 'description', 3)
      
      if (options.includeCategories !== false) {
        this.searchInField(tokens, this.index.categoryIndex, componentScores, 'category', 5)
      }
      
      if (options.includeDependencies !== false) {
        this.searchInField(tokens, this.index.dependencyIndex, componentScores, 'dependencies', 2)
      }

      // Apply fuzzy matching for typos
      if (options.fuzzy !== false) {
        this.applyFuzzyMatching(tokens, componentScores)
      }

      // Convert to results array
      const results: SearchResult[] = []
      for (const [componentId, { score, fields }] of componentScores) {
        const component = this.index.components.get(componentId)
        if (component && score >= (options.minScore || 0)) {
          results.push({
            component,
            matchScore: score,
            matchedFields: Array.from(fields)
          })
        }
      }

      // Sort by relevance score
      results.sort((a, b) => b.matchScore - a.matchScore)

      // Apply result limit
      const maxResults = options.maxResults || 100
      const limitedResults = results.slice(0, maxResults)

      // Cache the result
      this.searchCache.set(cacheKey, limitedResults)

      // Record search in history
      this.recordSearch(query, limitedResults.length)

      return limitedResults
    }, { query, resultCount: 0 })
  }

  /**
   * Searches in a specific field index
   */
  private searchInField(
    tokens: string[],
    fieldIndex: Map<string, string[]>,
    componentScores: Map<string, { score: number; fields: Set<string> }>,
    fieldName: string,
    baseWeight: number
  ) {
    for (const token of tokens) {
      // Exact match
      const exactMatches = fieldIndex.get(token) || []
      for (const componentId of exactMatches) {
        this.addScore(componentScores, componentId, fieldName, baseWeight * 2)
      }

      // Prefix match
      for (const [indexToken, componentIds] of fieldIndex) {
        if (indexToken.startsWith(token) && indexToken !== token) {
          for (const componentId of componentIds) {
            this.addScore(componentScores, componentId, fieldName, baseWeight)
          }
        }
      }

      // Contains match
      for (const [indexToken, componentIds] of fieldIndex) {
        if (indexToken.includes(token) && !indexToken.startsWith(token)) {
          for (const componentId of componentIds) {
            this.addScore(componentScores, componentId, fieldName, baseWeight * 0.5)
          }
        }
      }
    }
  }

  /**
   * Applies fuzzy matching for typo tolerance
   */
  private applyFuzzyMatching(
    tokens: string[],
    componentScores: Map<string, { score: number; fields: Set<string> }>
  ) {
    for (const token of tokens) {
      if (token.length < 3) continue // Skip fuzzy matching for very short tokens

      for (const keyword of this.index.keywords) {
        const distance = this.levenshteinDistance(token, keyword)
        const maxDistance = Math.floor(token.length / 3) // Allow 1 error per 3 characters
        
        if (distance > 0 && distance <= maxDistance) {
          // Find components that contain this keyword
          const matches = [
            ...(this.index.nameIndex.get(keyword) || []),
            ...(this.index.descriptionIndex.get(keyword) || []),
            ...(this.index.categoryIndex.get(keyword) || []),
            ...(this.index.dependencyIndex.get(keyword) || [])
          ]

          const fuzzyScore = 1 / (distance + 1) // Lower score for higher distance
          for (const componentId of matches) {
            this.addScore(componentScores, componentId, 'fuzzy', fuzzyScore)
          }
        }
      }
    }
  }

  /**
   * Calculates Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Adds score to a component
   */
  private addScore(
    componentScores: Map<string, { score: number; fields: Set<string> }>,
    componentId: string,
    field: string,
    score: number
  ) {
    if (!componentScores.has(componentId)) {
      componentScores.set(componentId, { score: 0, fields: new Set() })
    }
    const current = componentScores.get(componentId)!
    current.score += score
    current.fields.add(field)
  }

  /**
   * Generates search suggestions based on query
   */
  getSuggestions(query: string, maxSuggestions = 10): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []
    const queryLower = query.toLowerCase()

    // Component name suggestions
    for (const component of this.registry.components) {
      if (component.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: component.name,
          type: 'component',
          score: this.calculateSuggestionScore(component.name, query),
          metadata: { componentId: component.id }
        })
      }
    }

    // Category suggestions
    const categories = new Set(this.registry.components.map(c => c.category))
    for (const category of categories) {
      if (category.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: category,
          type: 'category',
          score: this.calculateSuggestionScore(category, query),
          metadata: { category }
        })
      }
    }

    // Dependency suggestions
    const dependencies = new Set<string>()
    for (const component of this.registry.components) {
      for (const dep of component.dependencies) {
        dependencies.add(dep.name)
      }
      if (component.radixPackage) dependencies.add(component.radixPackage)
      if (component.externalLibraries) {
        for (const lib of component.externalLibraries) {
          dependencies.add(lib)
        }
      }
    }

    for (const dep of dependencies) {
      if (dep.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: dep,
          type: 'dependency',
          score: this.calculateSuggestionScore(dep, query),
          metadata: { dependency: dep }
        })
      }
    }

    // Recent search suggestions
    for (const historyItem of this.searchHistory.slice(-10)) {
      if (historyItem.query.toLowerCase().includes(queryLower) && historyItem.query !== query) {
        suggestions.push({
          text: historyItem.query,
          type: 'recent',
          score: this.calculateSuggestionScore(historyItem.query, query) * 0.8, // Lower priority
          metadata: {}
        })
      }
    }

    // Sort by score and limit results
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
  }

  /**
   * Calculates suggestion relevance score
   */
  private calculateSuggestionScore(suggestion: string, query: string): number {
    const suggestionLower = suggestion.toLowerCase()
    const queryLower = query.toLowerCase()

    if (suggestionLower === queryLower) return 100
    if (suggestionLower.startsWith(queryLower)) return 80
    if (suggestionLower.includes(queryLower)) return 60

    // Calculate based on how much of the query matches
    const matchRatio = queryLower.length / suggestionLower.length
    return matchRatio * 40
  }

  /**
   * Gets search history
   */
  getSearchHistory(): SearchHistory[] {
    return [...this.searchHistory].reverse() // Most recent first
  }

  /**
   * Clears search history
   */
  clearSearchHistory(): void {
    this.searchHistory = []
    this.saveSearchHistory()
  }

  /**
   * Records a search in history
   */
  private recordSearch(query: string, resultCount: number): void {
    // Don't record empty queries or duplicates
    if (!query.trim() || this.searchHistory.some(h => h.query === query)) {
      return
    }

    this.searchHistory.push({
      query,
      timestamp: Date.now(),
      resultCount
    })

    // Limit history size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(-this.maxHistorySize)
    }

    this.saveSearchHistory()
  }

  /**
   * Loads search history from localStorage
   */
  private loadSearchHistory(): void {
    try {
      const stored = localStorage.getItem('component-showcase-search-history')
      if (stored) {
        this.searchHistory = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load search history:', error)
      this.searchHistory = []
    }
  }

  /**
   * Saves search history to localStorage
   */
  private saveSearchHistory(): void {
    try {
      localStorage.setItem('component-showcase-search-history', JSON.stringify(this.searchHistory))
    } catch (error) {
      console.warn('Failed to save search history:', error)
    }
  }

  /**
   * Updates the search index when registry changes
   */
  updateIndex(registry: ComponentRegistry): void {
    this.registry = registry
    this.index = this.buildSearchIndex()
  }
}

/**
 * Creates a singleton search engine instance
 */
let searchEngineInstance: AdvancedSearchEngine | null = null

export function createSearchEngine(registry: ComponentRegistry): AdvancedSearchEngine {
  if (!searchEngineInstance) {
    searchEngineInstance = new AdvancedSearchEngine(registry)
  }
  return searchEngineInstance
}

export function getSearchEngine(): AdvancedSearchEngine | null {
  return searchEngineInstance
}