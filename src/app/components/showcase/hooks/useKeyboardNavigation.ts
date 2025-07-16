'use client'

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

export interface KeyboardNavigationOptions {
  shortcuts?: KeyboardShortcut[]
  enableArrowNavigation?: boolean
  enableTabNavigation?: boolean
  enableEscapeHandling?: boolean
  onEscape?: () => void
  focusableSelector?: string
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const {
    shortcuts = [],
    enableArrowNavigation = false,
    enableTabNavigation = true,
    enableEscapeHandling = true,
    onEscape,
    focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  } = options

  const containerRef = useRef<HTMLElement>(null)
  const focusableElementsRef = useRef<HTMLElement[]>([])

  // Update focusable elements
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[]

    focusableElementsRef.current = elements.filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    )
  }, [focusableSelector])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Handle shortcuts
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.action()
          return
        }
      }

      // Handle escape key
      if (enableEscapeHandling && event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }

      // Handle arrow navigation
      if (enableArrowNavigation && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
        event.preventDefault()
        updateFocusableElements()

        const currentIndex = focusableElementsRef.current.findIndex(
          (el) => el === document.activeElement
        )

        if (currentIndex === -1) {
          // No element focused, focus first
          focusableElementsRef.current[0]?.focus()
          return
        }

        let nextIndex: number
        if (event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % focusableElementsRef.current.length
        } else {
          nextIndex = currentIndex === 0 
            ? focusableElementsRef.current.length - 1 
            : currentIndex - 1
        }

        focusableElementsRef.current[nextIndex]?.focus()
      }

      // Handle tab navigation enhancement
      if (enableTabNavigation && event.key === 'Tab') {
        updateFocusableElements()
        
        // Let browser handle tab navigation but ensure we have updated elements
        setTimeout(() => {
          const activeElement = document.activeElement as HTMLElement
          if (activeElement && containerRef.current?.contains(activeElement)) {
            // Ensure the focused element is visible
            activeElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest',
              inline: 'nearest'
            })
          }
        }, 0)
      }
    },
    [shortcuts, enableArrowNavigation, enableTabNavigation, enableEscapeHandling, onEscape, updateFocusableElements]
  )

  // Focus management utilities
  const focusFirst = useCallback(() => {
    updateFocusableElements()
    focusableElementsRef.current[0]?.focus()
  }, [updateFocusableElements])

  const focusLast = useCallback(() => {
    updateFocusableElements()
    const elements = focusableElementsRef.current
    elements[elements.length - 1]?.focus()
  }, [updateFocusableElements])

  const focusNext = useCallback(() => {
    updateFocusableElements()
    const currentIndex = focusableElementsRef.current.findIndex(
      (el) => el === document.activeElement
    )
    const nextIndex = (currentIndex + 1) % focusableElementsRef.current.length
    focusableElementsRef.current[nextIndex]?.focus()
  }, [updateFocusableElements])

  const focusPrevious = useCallback(() => {
    updateFocusableElements()
    const currentIndex = focusableElementsRef.current.findIndex(
      (el) => el === document.activeElement
    )
    const prevIndex = currentIndex === 0 
      ? focusableElementsRef.current.length - 1 
      : currentIndex - 1
    focusableElementsRef.current[prevIndex]?.focus()
  }, [updateFocusableElements])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('keydown', handleKeyDown)
    
    // Update focusable elements when DOM changes
    const observer = new MutationObserver(updateFocusableElements)
    observer.observe(container, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['disabled', 'tabindex', 'hidden']
    })

    // Initial update
    updateFocusableElements()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      observer.disconnect()
    }
  }, [handleKeyDown, updateFocusableElements])

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    updateFocusableElements
  }
}

// Hook for managing focus trap (useful for modals, dropdowns)
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element when trap becomes active
    firstElement?.focus()

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

// Hook for skip links
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLElement>(null)

  const addSkipLink = useCallback((targetId: string, label: string) => {
    if (!skipLinksRef.current) return

    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = label
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })

    skipLinksRef.current.appendChild(skipLink)
  }, [])

  return { skipLinksRef, addSkipLink }
}