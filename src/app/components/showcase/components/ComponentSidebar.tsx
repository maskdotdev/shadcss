'use client'

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { ComponentInfo, ComponentCategory, ComponentRegistry } from '../lib/types'
import { searchComponents } from '../lib/component-registry'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { AdvancedSearchEngine, createSearchEngine } from '../lib/advanced-search'
import { FilteringSystem, FilterState } from '../lib/filtering-system'
import AdvancedSearchInput from './AdvancedSearchInput'
import VirtualizedComponentList from './VirtualizedComponentList'

interface ComponentSidebarProps {
  componentRegistry: ComponentRegistry
  selectedComponent: string | null
  onComponentSelect: (componentId: string) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  categoryFilter?: ComponentCategory | null
  onCategoryFilterChange?: (category: ComponentCategory | null) => void
  className?: string
}

interface ComponentListItemProps {
  component: ComponentInfo
  isSelected: boolean
  onClick: () => void
}

const ComponentListItem: React.FC<ComponentListItemProps> = ({ 
  component, 
  isSelected, 
  onClick 
}) => {
  // Create accessible description
  const versionInfo = []
  if (component.hasOriginalVersion) versionInfo.push('Original version available')
  if (component.hasCssModulesVersion) versionInfo.push('CSS Modules version available')
  
  const dependencyInfo = []
  if (component.radixPackage) dependencyInfo.push('Uses Radix UI')
  if (component.externalLibraries?.length) {
    dependencyInfo.push(`Uses ${component.externalLibraries.join(', ')}`)
  }

  const ariaDescription = [
    component.description,
    ...versionInfo,
    ...dependencyInfo
  ].filter(Boolean).join('. ')

  return (
    <button
      onClick={onClick}
      aria-pressed={isSelected}
      aria-describedby={`${component.id}-description`}
      className={`
        w-full text-left px-3 py-2 rounded-md transition-colors duration-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 text-blue-700 dark:text-blue-300' 
          : 'text-gray-700 dark:text-gray-300'
        }
      `}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{component.name}</span>
          <div className="flex items-center gap-1" aria-hidden="true">
            {/* Version indicators */}
            {component.hasOriginalVersion && (
              <span 
                className="inline-block w-2 h-2 bg-green-500 rounded-full" 
                title="Original version available"
              />
            )}
            {component.hasCssModulesVersion && (
              <span 
                className="inline-block w-2 h-2 bg-blue-500 rounded-full" 
                title="CSS Modules version available"
              />
            )}
          </div>
        </div>
        
        <p 
          id={`${component.id}-description`}
          className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
        >
          {component.description}
        </p>
        
        {/* Dependency indicators */}
        {(component.radixPackage || (component.externalLibraries && component.externalLibraries.length > 0)) && (
          <div className="flex flex-wrap gap-1 mt-1" aria-hidden="true">
            {component.radixPackage && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                Radix UI
              </span>
            )}
            {component.externalLibraries?.map((lib) => (
              <span 
                key={lib}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
              >
                {lib}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Screen reader only description */}
      <span className="sr-only">{ariaDescription}</span>
    </button>
  )
}

const ComponentSidebar: React.FC<ComponentSidebarProps> = ({
  componentRegistry,
  selectedComponent,
  onComponentSelect,
  searchQuery = '',
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  className = ''
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<ComponentCategory | null>(categoryFilter || null)
  const [searchEngine, setSearchEngine] = useState<AdvancedSearchEngine | null>(null)
  const [filteringSystem, setFilteringSystem] = useState<FilteringSystem | null>(null)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  // Initialize search engine and filtering system
  useEffect(() => {
    const engine = createSearchEngine(componentRegistry)
    const filtering = new FilteringSystem(componentRegistry)
    setSearchEngine(engine)
    setFilteringSystem(filtering)
  }, [componentRegistry])

  // Use internal state if no external handlers provided
  const currentSearchQuery = onSearchChange ? searchQuery : internalSearchQuery
  const currentCategoryFilter = onCategoryFilterChange ? categoryFilter : internalCategoryFilter

  // Debounce search query
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(currentSearchQuery)
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [currentSearchQuery])

  const handleSearchChange = useCallback((query: string) => {
    if (onSearchChange) {
      onSearchChange(query)
    } else {
      setInternalSearchQuery(query)
    }
  }, [onSearchChange])

  const handleCategoryFilterChange = useCallback((category: ComponentCategory | null) => {
    if (onCategoryFilterChange) {
      onCategoryFilterChange(category)
    } else {
      setInternalCategoryFilter(category)
    }
  }, [onCategoryFilterChange])

  // Filter and sort components using advanced systems
  const filteredComponents = useMemo(() => {
    if (!searchEngine || !filteringSystem) {
      return componentRegistry.components.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Use filtering system for better performance
    const filterResult = filteringSystem.filter({
      searchQuery: debouncedSearchQuery,
      category: currentCategoryFilter
    })

    return filteringSystem.sort(filterResult.components, 'name', 'asc')
  }, [searchEngine, filteringSystem, debouncedSearchQuery, currentCategoryFilter, componentRegistry.components])

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const categorySet = new Set(componentRegistry.components.map(c => c.category))
    return Array.from(categorySet).sort()
  }, [])

  const categoryLabels: Record<ComponentCategory, string> = {
    basic: 'Basic',
    layout: 'Layout', 
    feedback: 'Feedback',
    navigation: 'Navigation',
    data: 'Data',
    overlay: 'Overlay'
  }

  // Keyboard navigation for component list
  const { containerRef: listContainerRef } = useKeyboardNavigation({
    enableArrowNavigation: true,
    enableTabNavigation: true,
    focusableSelector: 'button[aria-pressed]'
  })

  // Focus search input when / is pressed
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
        const activeElement = document.activeElement
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          event.preventDefault()
          searchInputRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Announce search results to screen readers
  const searchResultsAnnouncement = useMemo(() => {
    if (!currentSearchQuery.trim()) return ''
    
    const count = filteredComponents.length
    if (count === 0) {
      return 'No components found'
    } else if (count === 1) {
      return `1 component found: ${filteredComponents[0].name}`
    } else {
      return `${count} components found`
    }
  }, [currentSearchQuery, filteredComponents])

  return (
    <div 
      className={`flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${className}`}
      role="navigation"
      aria-label="Component navigation"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Components
        </h2>
        
        {/* Advanced Search Input */}
        <div className="mb-3">
          <AdvancedSearchInput
            searchEngine={searchEngine}
            value={currentSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search components... (Press / to focus)"
            showHistory={true}
            showSuggestions={true}
            debounceMs={300}
          />
        </div>

        {/* Live region for search results announcements */}
        <div 
          id="search-results-status"
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        >
          {searchResultsAnnouncement}
        </div>

        {/* Category Filter */}
        <label htmlFor="category-filter" className="sr-only">
          Filter by category
        </label>
        <select
          id="category-filter"
          value={currentCategoryFilter || ''}
          onChange={(e) => handleCategoryFilterChange(e.target.value as ComponentCategory || null)}
          aria-describedby="category-filter-description"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </select>
        <div id="category-filter-description" className="sr-only">
          Filter components by category to narrow down the list
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-hidden" role="region" aria-label="Component list">
        {filteredComponents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-8" role="status">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {currentSearchQuery.trim() ? 'No components match your search' : 'No components found'}
              </p>
              {currentSearchQuery.trim() && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <div className="space-y-1 p-2">
              {filteredComponents.map((component) => (
                <button
                  key={component.id}
                  onClick={() => onComponentSelect(component.id)}
                  aria-pressed={selectedComponent === component.id}
                  aria-describedby={`${component.id}-description`}
                  className={`
                    w-full text-left px-3 py-2 rounded-md transition-colors duration-200
                    hover:bg-gray-100 dark:hover:bg-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    ${selectedComponent === component.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 text-blue-700 dark:text-blue-300' 
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{component.name}</span>
                      <div className="flex items-center gap-1" aria-hidden="true">
                        {/* Version indicators */}
                        {component.hasOriginalVersion && (
                          <span 
                            className="inline-block w-2 h-2 bg-green-500 rounded-full" 
                            title="Original version available"
                          />
                        )}
                        {component.hasCssModulesVersion && (
                          <span 
                            className="inline-block w-2 h-2 bg-blue-500 rounded-full" 
                            title="CSS Modules version available"
                          />
                        )}
                      </div>
                    </div>
                    
                    <p 
                      id={`${component.id}-description`}
                      className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
                    >
                      {component.description}
                    </p>
                    
                    {/* Dependency indicators */}
                    {(component.radixPackage || (component.externalLibraries && component.externalLibraries.length > 0)) && (
                      <div className="flex flex-wrap gap-1 mt-1" aria-hidden="true">
                        {component.radixPackage && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                            Radix UI
                          </span>
                        )}
                        {component.externalLibraries?.map((lib) => (
                          <span 
                            key={lib}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                          >
                            {lib}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <span>
              {filteredComponents.length} of {componentRegistry.components.length} components
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                <span>Original</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                <span>CSS Modules</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComponentSidebar