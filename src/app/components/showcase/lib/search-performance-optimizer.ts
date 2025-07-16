/**
 * Performance optimizations for search and rendering
 * Includes debouncing, memoization, and virtual scrolling optimizations
 */

import { ComponentInfo, SearchResult } from './types'
import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

// Debounced search hook
export function useDebounceSearch(
  searchFn: (query: string) => SearchResult[],
  delay: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const searchCountRef = useRef(0)

  const debouncedSearch = useCallback((searchQuery: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsSearching(true)
    const currentSearchId = ++searchCountRef.current

    timeoutRef.current = setTimeout(() => {
      // Only process if this is still the latest search
      if (currentSearchId === searchCountRef.current) {
        const searchResults = searchFn(searchQuery)
        setResults(searchResults)
        setIsSearching(false)
      }
    }, delay)
  }, [searchFn, delay])

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery)
    debouncedSearch(newQuery)
  }, [debouncedSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    query,
    results,
    isSearching,
    updateQuery,
    setQuery: updateQuery
  }
}

// Memoized component list hook
export function useMemoizedComponentList(
  components: ComponentInfo[],
  searchQuery: string,
  categoryFilter: string | null,
  dependencies: string[]
) {
  return useMemo(() => {
    let filtered = components

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.category.toLowerCase().includes(query) ||
        component.dependencies.some(dep => dep.name.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(component => component.category === categoryFilter)
    }

    // Apply dependency filters
    if (dependencies.length > 0) {
      filtered = filtered.filter(component =>
        dependencies.every(dep =>
          component.dependencies.some(compDep => compDep.name.includes(dep)) ||
          component.radixPackage?.includes(dep) ||
          component.externalLibraries?.some(lib => lib.includes(dep))
        )
      )
    }

    return filtered
  }, [components, searchQuery, categoryFilter, dependencies])
}

// Performance-optimized search index
export class SearchIndex {
  private nameIndex = new Map<string, Set<string>>()
  private descriptionIndex = new Map<string, Set<string>>()
  private categoryIndex = new Map<string, Set<string>>()
  private dependencyIndex = new Map<string, Set<string>>()
  private componentMap = new Map<string, ComponentInfo>()

  constructor(components: ComponentInfo[]) {
    this.buildIndex(components)
  }

  private buildIndex(components: ComponentInfo[]) {
    for (const component of components) {
      this.componentMap.set(component.id, component)

      // Index name
      this.addToIndex(this.nameIndex, component.name, component.id)

      // Index description
      this.addToIndex(this.descriptionIndex, component.description, component.id)

      // Index category
      this.addToIndex(this.categoryIndex, component.category, component.id)

      // Index dependencies
      for (const dep of component.dependencies) {
        this.addToIndex(this.dependencyIndex, dep.name, component.id)
      }

      if (component.radixPackage) {
        this.addToIndex(this.dependencyIndex, component.radixPackage, component.id)
      }

      if (component.externalLibraries) {
        for (const lib of component.externalLibraries) {
          this.addToIndex(this.dependencyIndex, lib, component.id)
        }
      }
    }
  }

  private addToIndex(index: Map<string, Set<string>>, text: string, componentId: string) {
    const tokens = this.tokenize(text)
    for (const token of tokens) {
      if (!index.has(token)) {
        index.set(token, new Set())
      }
      index.get(token)!.add(componentId)
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1)
  }

  search(query: string): ComponentInfo[] {
    if (!query.trim()) {
      return Array.from(this.componentMap.values())
    }

    const tokens = this.tokenize(query)
    const componentIds = new Set<string>()
    const scores = new Map<string, number>()

    for (const token of tokens) {
      // Search in name (highest weight)
      this.searchInIndex(this.nameIndex, token, componentIds, scores, 10)
      
      // Search in description
      this.searchInIndex(this.descriptionIndex, token, componentIds, scores, 3)
      
      // Search in category
      this.searchInIndex(this.categoryIndex, token, componentIds, scores, 5)
      
      // Search in dependencies
      this.searchInIndex(this.dependencyIndex, token, componentIds, scores, 2)
    }

    // Convert to components and sort by score
    const results = Array.from(componentIds)
      .map(id => ({
        component: this.componentMap.get(id)!,
        score: scores.get(id) || 0
      }))
      .sort((a, b) => b.score - a.score)
      .map(result => result.component)

    return results
  }

  private searchInIndex(
    index: Map<string, Set<string>>,
    token: string,
    componentIds: Set<string>,
    scores: Map<string, number>,
    weight: number
  ) {
    // Exact match
    const exactMatches = index.get(token)
    if (exactMatches) {
      for (const id of exactMatches) {
        componentIds.add(id)
        scores.set(id, (scores.get(id) || 0) + weight * 2)
      }
    }

    // Prefix match
    for (const [indexToken, ids] of index) {
      if (indexToken.startsWith(token) && indexToken !== token) {
        for (const id of ids) {
          componentIds.add(id)
          scores.set(id, (scores.get(id) || 0) + weight)
        }
      }
    }
  }
}

// Virtual scrolling optimization hook
export function useVirtualScrolling(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      top: (visibleRange.startIndex + index) * itemHeight
    }))
  }, [items, visibleRange, itemHeight])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange
  }
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  useEffect(() => {
    if (!targetRef.current) return

    observerRef.current = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    observerRef.current.observe(targetRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [callback, options])

  return targetRef
}

// Optimized component rendering hook
export function useOptimizedRendering<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  batchSize: number = 10
) {
  const [renderedCount, setRenderedCount] = useState(Math.min(batchSize, items.length))
  const [isRendering, setIsRendering] = useState(false)

  const renderMoreItems = useCallback(() => {
    if (renderedCount >= items.length || isRendering) return

    setIsRendering(true)
    
    // Use requestIdleCallback for non-blocking rendering
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        setRenderedCount(prev => Math.min(prev + batchSize, items.length))
        setIsRendering(false)
      })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        setRenderedCount(prev => Math.min(prev + batchSize, items.length))
        setIsRendering(false)
      }, 0)
    }
  }, [renderedCount, items.length, isRendering, batchSize])

  const visibleItems = useMemo(() => {
    return items.slice(0, renderedCount)
  }, [items, renderedCount])

  const renderedItems = useMemo(() => {
    return visibleItems.map(renderItem)
  }, [visibleItems, renderItem])

  // Auto-render more items when scrolling near the end
  const loadMoreRef = useIntersectionObserver(
    useCallback((entries) => {
      if (entries[0].isIntersecting) {
        renderMoreItems()
      }
    }, [renderMoreItems])
  )

  return {
    renderedItems,
    hasMore: renderedCount < items.length,
    isRendering,
    loadMoreRef,
    renderMoreItems
  }
}

// Performance metrics hook
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({
    searchTime: 0,
    renderTime: 0,
    totalComponents: 0,
    visibleComponents: 0
  })

  const measureSearch = useCallback(<T,>(searchFn: () => T): T => {
    const start = performance.now()
    const result = searchFn()
    const end = performance.now()
    
    setMetrics(prev => ({
      ...prev,
      searchTime: end - start
    }))
    
    return result
  }, [])

  const measureRender = useCallback(<T,>(renderFn: () => T): T => {
    const start = performance.now()
    const result = renderFn()
    const end = performance.now()
    
    setMetrics(prev => ({
      ...prev,
      renderTime: end - start
    }))
    
    return result
  }, [])

  const updateComponentCounts = useCallback((total: number, visible: number) => {
    setMetrics(prev => ({
      ...prev,
      totalComponents: total,
      visibleComponents: visible
    }))
  }, [])

  return {
    metrics,
    measureSearch,
    measureRender,
    updateComponentCounts
  }
}

// Memory usage monitoring
export function useMemoryMonitoring() {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number
    total: number
    limit: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryUsage({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        })
      }
    }

    updateMemoryUsage()
    const interval = setInterval(updateMemoryUsage, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return memoryUsage
}

export default {
  useDebounceSearch,
  useMemoizedComponentList,
  SearchIndex,
  useVirtualScrolling,
  useIntersectionObserver,
  useOptimizedRendering,
  usePerformanceMetrics,
  useMemoryMonitoring
}