'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { SearchSuggestion, SearchHistory } from '../lib/types'
import { AdvancedSearchEngine } from '../lib/advanced-search'

interface AdvancedSearchInputProps {
  searchEngine: AdvancedSearchEngine | null
  value: string
  onChange: (value: string) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  placeholder?: string
  className?: string
  showHistory?: boolean
  showSuggestions?: boolean
  debounceMs?: number
}

interface SearchDropdownProps {
  suggestions: SearchSuggestion[]
  history: SearchHistory[]
  onSuggestionClick: (suggestion: SearchSuggestion) => void
  onHistoryClick: (historyItem: SearchHistory) => void
  onClearHistory: () => void
  isVisible: boolean
  highlightedIndex: number
  showHistory: boolean
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  suggestions,
  history,
  onSuggestionClick,
  onHistoryClick,
  onClearHistory,
  isVisible,
  highlightedIndex,
  showHistory
}) => {
  if (!isVisible) return null

  const hasSuggestions = suggestions.length > 0
  const hasHistory = history.length > 0 && showHistory

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-80 overflow-y-auto">
      {hasSuggestions && (
        <div className="p-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
            Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={`suggestion-${index}`}
              onClick={() => onSuggestionClick(suggestion)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                index === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1 truncate">{suggestion.text}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getSuggestionTypeStyle(suggestion.type)}`}>
                  {getSuggestionTypeLabel(suggestion.type)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasSuggestions && hasHistory && (
        <div className="border-t border-gray-200 dark:border-gray-600" />
      )}

      {hasHistory && (
        <div className="p-2">
          <div className="flex items-center justify-between mb-2 px-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Recent Searches
            </span>
            <button
              onClick={onClearHistory}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
          {history.slice(0, 5).map((historyItem, index) => (
            <button
              key={`history-${index}`}
              onClick={() => onHistoryClick(historyItem)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                index + suggestions.length === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1 truncate">{historyItem.query}</span>
                <span className="text-xs text-gray-400">
                  {historyItem.resultCount} results
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!hasSuggestions && !hasHistory && (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No suggestions available
        </div>
      )}
    </div>
  )
}

function getSuggestionTypeStyle(type: SearchSuggestion['type']): string {
  switch (type) {
    case 'component':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
    case 'category':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    case 'dependency':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
    case 'recent':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

function getSuggestionTypeLabel(type: SearchSuggestion['type']): string {
  switch (type) {
    case 'component':
      return 'Component'
    case 'category':
      return 'Category'
    case 'dependency':
      return 'Library'
    case 'recent':
      return 'Recent'
    default:
      return 'Other'
  }
}

const AdvancedSearchInput: React.FC<AdvancedSearchInputProps> = ({
  searchEngine,
  value,
  onChange,
  onSuggestionSelect,
  placeholder = 'Search components...',
  className = '',
  showHistory = true,
  showSuggestions = true,
  debounceMs = 300
}) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounced suggestion fetching
  const fetchSuggestions = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (searchEngine && query.trim()) {
        const newSuggestions = searchEngine.getSuggestions(query, 8)
        setSuggestions(newSuggestions)
      } else {
        setSuggestions([])
      }
    }, debounceMs)
  }, [searchEngine, debounceMs])

  // Update suggestions when value changes
  useEffect(() => {
    if (showSuggestions) {
      fetchSuggestions(value)
    }
  }, [value, fetchSuggestions, showSuggestions])

  // Load search history
  useEffect(() => {
    if (searchEngine && showHistory) {
      setHistory(searchEngine.getSearchHistory())
    }
  }, [searchEngine, showHistory])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setHighlightedIndex(-1)
    
    // Show dropdown if there's input and we're focused
    if (isFocused && (newValue.trim() || (showHistory && history.length > 0))) {
      setIsDropdownVisible(true)
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (value.trim() || (showHistory && history.length > 0)) {
      setIsDropdownVisible(true)
    }
  }

  const handleInputBlur = () => {
    setIsFocused(false)
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setIsDropdownVisible(false)
      setHighlightedIndex(-1)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible) return

    const totalItems = suggestions.length + (showHistory ? Math.min(history.length, 5) : 0)

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev - 1 + totalItems) % totalItems)
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0) {
          if (highlightedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[highlightedIndex])
          } else {
            const historyIndex = highlightedIndex - suggestions.length
            if (historyIndex < history.length) {
              handleHistoryClick(history[historyIndex])
            }
          }
        }
        break
      case 'Escape':
        setIsDropdownVisible(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text)
    setIsDropdownVisible(false)
    setHighlightedIndex(-1)
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
  }

  const handleHistoryClick = (historyItem: SearchHistory) => {
    onChange(historyItem.query)
    setIsDropdownVisible(false)
    setHighlightedIndex(-1)
  }

  const handleClearHistory = () => {
    if (searchEngine) {
      searchEngine.clearSearchHistory()
      setHistory([])
    }
  }

  const handleClearInput = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 pl-9 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-colors duration-200"
          aria-label="Search components"
          aria-expanded={isDropdownVisible}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        
        {/* Search icon */}
        <svg 
          className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClearInput}
            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <SearchDropdown
        suggestions={suggestions}
        history={history}
        onSuggestionClick={handleSuggestionClick}
        onHistoryClick={handleHistoryClick}
        onClearHistory={handleClearHistory}
        isVisible={isDropdownVisible}
        highlightedIndex={highlightedIndex}
        showHistory={showHistory}
      />
    </div>
  )
}

export default AdvancedSearchInput