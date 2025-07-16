'use client'

import React, { useState } from 'react'
import { FilterState, FilterResult, SortOption, AvailableFilters } from '../lib/filtering-system'
import { ComponentCategory, ComponentVersion } from '../lib/types'

interface FilterPanelProps {
  filterState: FilterState
  filterResult: FilterResult
  onFilterChange: (updates: Partial<FilterState>) => void
  onResetFilters: () => void
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  isCollapsible?: boolean
  defaultExpanded?: boolean
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  isCollapsible = true,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 text-left flex items-center justify-between ${
          isCollapsible ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''
        } transition-colors`}
        disabled={!isCollapsible}
      >
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {title}
        </span>
        {isCollapsible && (
          <svg
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  )
}

interface FilterOptionProps {
  label: string
  count?: number
  isSelected: boolean
  onClick: () => void
}

const FilterOption: React.FC<FilterOptionProps> = ({ label, count, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
      isSelected
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  </button>
)

const FilterPanel: React.FC<FilterPanelProps> = ({
  filterState,
  filterResult,
  onFilterChange,
  onResetFilters,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const hasActiveFilters = Object.values(filterState).some(value => 
    value !== undefined && value !== null && value !== ''
  )

  const handleCategoryChange = (category: ComponentCategory | null) => {
    onFilterChange({ category })
  }

  const handleVersionChange = (version: ComponentVersion | 'both' | null) => {
    onFilterChange({ version })
  }

  const handleDependencyChange = (dependency: string | null) => {
    onFilterChange({ dependency })
  }

  const handleRadixPackageChange = (radixPackage: string | null) => {
    onFilterChange({ radixPackage })
  }

  const handleExternalLibraryChange = (externalLibrary: string | null) => {
    onFilterChange({ externalLibrary })
  }

  const handleSortChange = (sortBy: SortOption) => {
    onFilterChange({ sortBy })
  }

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    onFilterChange({ sortOrder })
  }

  if (isCollapsed) {
    return (
      <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            aria-label="Expand filters"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h3>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Collapse filters"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filterResult.filteredCount} of {filterResult.totalCount} components
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Active Filters */}
      {filterResult.appliedFilters.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Active Filters
          </div>
          <div className="space-y-1">
            {filterResult.appliedFilters.map((filter, index) => (
              <div
                key={index}
                className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
              >
                {filter}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      <FilterSection title="Sort By" defaultExpanded={false}>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {(['name', 'category', 'dependencies', 'versions'] as SortOption[]).map((option) => (
              <FilterOption
                key={option}
                label={option.charAt(0).toUpperCase() + option.slice(1)}
                isSelected={filterState.sortBy === option}
                onClick={() => handleSortChange(option)}
              />
            ))}
          </div>
          
          <div className="flex gap-2 mt-3">
            <FilterOption
              label="Ascending"
              isSelected={filterState.sortOrder !== 'desc'}
              onClick={() => handleSortOrderChange('asc')}
            />
            <FilterOption
              label="Descending"
              isSelected={filterState.sortOrder === 'desc'}
              onClick={() => handleSortOrderChange('desc')}
            />
          </div>
        </div>
      </FilterSection>

      {/* Category Filter */}
      <FilterSection title="Categories">
        <div className="space-y-1">
          <FilterOption
            label="All Categories"
            count={filterResult.totalCount}
            isSelected={!filterState.category}
            onClick={() => handleCategoryChange(null)}
          />
          {filterResult.availableFilters.categories.map((category) => (
            <FilterOption
              key={category.value}
              label={category.label}
              count={category.count}
              isSelected={filterState.category === category.value}
              onClick={() => handleCategoryChange(category.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Version Filter */}
      <FilterSection title="Versions">
        <div className="space-y-1">
          <FilterOption
            label="All Versions"
            isSelected={!filterState.version}
            onClick={() => handleVersionChange(null)}
          />
          <FilterOption
            label="Original Only"
            isSelected={filterState.version === 'original'}
            onClick={() => handleVersionChange('original')}
          />
          <FilterOption
            label="CSS Modules Only"
            isSelected={filterState.version === 'css-modules'}
            onClick={() => handleVersionChange('css-modules')}
          />
          {filterResult.availableFilters.versions.map((version) => (
            <FilterOption
              key={version.value}
              label={version.label}
              count={version.count}
              isSelected={filterState.version === version.value}
              onClick={() => handleVersionChange(version.value as ComponentVersion | 'both')}
            />
          ))}
        </div>
      </FilterSection>

      {/* Radix UI Packages */}
      {filterResult.availableFilters.radixPackages.length > 0 && (
        <FilterSection title="Radix UI Packages" defaultExpanded={false}>
          <div className="space-y-1">
            <FilterOption
              label="All Packages"
              isSelected={!filterState.radixPackage}
              onClick={() => handleRadixPackageChange(null)}
            />
            {filterResult.availableFilters.radixPackages.map((pkg) => (
              <FilterOption
                key={pkg.value}
                label={pkg.label}
                count={pkg.count}
                isSelected={filterState.radixPackage === pkg.value}
                onClick={() => handleRadixPackageChange(pkg.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* External Libraries */}
      {filterResult.availableFilters.externalLibraries.length > 0 && (
        <FilterSection title="External Libraries" defaultExpanded={false}>
          <div className="space-y-1">
            <FilterOption
              label="All Libraries"
              isSelected={!filterState.externalLibrary}
              onClick={() => handleExternalLibraryChange(null)}
            />
            {filterResult.availableFilters.externalLibraries.map((lib) => (
              <FilterOption
                key={lib.value}
                label={lib.label}
                count={lib.count}
                isSelected={filterState.externalLibrary === lib.value}
                onClick={() => handleExternalLibraryChange(lib.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Dependencies */}
      {filterResult.availableFilters.dependencies.length > 0 && (
        <FilterSection title="All Dependencies" defaultExpanded={false}>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            <FilterOption
              label="All Dependencies"
              isSelected={!filterState.dependency}
              onClick={() => handleDependencyChange(null)}
            />
            {filterResult.availableFilters.dependencies.map((dep) => (
              <FilterOption
                key={dep.value}
                label={dep.label}
                count={dep.count}
                isSelected={filterState.dependency === dep.value}
                onClick={() => handleDependencyChange(dep.value)}
              />
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  )
}

export default FilterPanel