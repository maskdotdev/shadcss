'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ComponentInfo } from '../lib/types'

interface VirtualizedComponentListProps {
  components: ComponentInfo[]
  selectedComponent: string | null
  onComponentSelect: (componentId: string) => void
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  className?: string
}

interface VirtualItem {
  index: number
  component: ComponentInfo
  top: number
  height: number
}

interface ComponentListItemProps {
  component: ComponentInfo
  isSelected: boolean
  onClick: () => void
  style: React.CSSProperties
}

const ComponentListItem: React.FC<ComponentListItemProps> = React.memo(({ 
  component, 
  isSelected, 
  onClick,
  style
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
    <div style={style} className="px-2">
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
    </div>
  )
})

ComponentListItem.displayName = 'ComponentListItem'

const VirtualizedComponentList: React.FC<VirtualizedComponentListProps> = ({
  components,
  selectedComponent,
  onComponentSelect,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5,
  className = ''
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Update container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect())
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate visible items
  const visibleItems = useMemo(() => {
    if (!containerRect) return []

    const actualContainerHeight = containerRect.height || containerHeight
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      components.length - 1,
      Math.ceil((scrollTop + actualContainerHeight) / itemHeight) + overscan
    )

    const items: VirtualItem[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        component: components[i],
        top: i * itemHeight,
        height: itemHeight
      })
    }

    return items
  }, [components, scrollTop, containerRect, itemHeight, containerHeight, overscan])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Scroll to selected component
  useEffect(() => {
    if (selectedComponent && scrollElementRef.current) {
      const selectedIndex = components.findIndex(c => c.id === selectedComponent)
      if (selectedIndex >= 0) {
        const targetScrollTop = selectedIndex * itemHeight
        const currentScrollTop = scrollElementRef.current.scrollTop
        const containerHeight = scrollElementRef.current.clientHeight

        // Only scroll if the item is not visible
        if (targetScrollTop < currentScrollTop || targetScrollTop > currentScrollTop + containerHeight - itemHeight) {
          scrollElementRef.current.scrollTo({
            top: Math.max(0, targetScrollTop - containerHeight / 2),
            behavior: 'smooth'
          })
        }
      }
    }
  }, [selectedComponent, components, itemHeight])

  // Total height for scrollbar
  const totalHeight = components.length * itemHeight

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedComponent) return

    const currentIndex = components.findIndex(c => c.id === selectedComponent)
    if (currentIndex === -1) return

    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        newIndex = Math.min(components.length - 1, currentIndex + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        newIndex = Math.max(0, currentIndex - 1)
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = components.length - 1
        break
      case 'PageDown':
        e.preventDefault()
        const pageSize = Math.floor((containerRect?.height || containerHeight) / itemHeight)
        newIndex = Math.min(components.length - 1, currentIndex + pageSize)
        break
      case 'PageUp':
        e.preventDefault()
        const pageSizeUp = Math.floor((containerRect?.height || containerHeight) / itemHeight)
        newIndex = Math.max(0, currentIndex - pageSizeUp)
        break
    }

    if (newIndex !== currentIndex) {
      onComponentSelect(components[newIndex].id)
    }
  }, [selectedComponent, components, onComponentSelect, containerRect, containerHeight, itemHeight])

  if (components.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center py-8" role="status">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No components found
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height: containerHeight }}
      role="listbox"
      aria-label={`${components.length} components`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={scrollElementRef}
        className="h-full overflow-auto"
        onScroll={handleScroll}
        style={{ height: '100%' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((item) => (
            <ComponentListItem
              key={item.component.id}
              component={item.component}
              isSelected={selectedComponent === item.component.id}
              onClick={() => onComponentSelect(item.component.id)}
              style={{
                position: 'absolute',
                top: item.top,
                left: 0,
                right: 0,
                height: item.height,
                display: 'flex',
                alignItems: 'center'
              }}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicators */}
      {components.length > 10 && (
        <div className="absolute right-2 top-2 bottom-2 w-1 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="bg-blue-500 rounded-full transition-all duration-150"
            style={{
              height: `${Math.max(10, (containerRect?.height || containerHeight) / totalHeight * 100)}%`,
              transform: `translateY(${scrollTop / totalHeight * (containerRect?.height || containerHeight)}px)`
            }}
          />
        </div>
      )}
    </div>
  )
}

export default VirtualizedComponentList