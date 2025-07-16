'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ComponentVersion, ComponentCategory, ComponentRegistry } from './lib/types'
import { createComponentRegistry, getComponentById } from './lib/component-registry'
import ComponentSidebar from './components/ComponentSidebar'
import LazyComponentLoader from './components/LazyComponentLoader'
import { AccessibilityPanel } from './components/AccessibilityPanel'
import { usePerformanceMonitor } from './lib/performance-monitor'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Button } from '@/components/shadcss-ui/button'
import { Badge } from '@/components/shadcss-ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/shadcss-ui/breadcrumb'

import { Menu, Home, Code, Info, ChevronLeft, Search, Keyboard, Shield } from 'lucide-react'
import { useKeyboardNavigation, useSkipLinks, type KeyboardShortcut } from './hooks/useKeyboardNavigation'
import { toast } from 'sonner'

interface ShowcaseState {
  selectedComponent: string | null
  searchQuery: string
  categoryFilter: ComponentCategory | null
  versionPreference: ComponentVersion
  selectedVariant: string | null
  sidebarCollapsed: boolean
  activeTab: 'preview' | 'code' | 'dependencies' | 'accessibility'
}

const STORAGE_KEY = 'component-showcase-preferences'

export default function ComponentShowcasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { recordInteraction, startTiming, endTiming } = usePerformanceMonitor()

  // Component registry state
  const [componentRegistry, setComponentRegistry] = useState<ComponentRegistry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)

  // Initialize state from URL parameters and localStorage
  const [state, setState] = useState<ShowcaseState>(() => {
    // Try to get preferences from localStorage
    let savedPreferences: Partial<ShowcaseState> = {}
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          savedPreferences = JSON.parse(saved)
        }
      } catch (error) {
        console.warn('Failed to load saved preferences:', error)
      }
    }

    return {
      selectedComponent: searchParams.get('component') || savedPreferences.selectedComponent || null,
      searchQuery: searchParams.get('search') || savedPreferences.searchQuery || '',
      categoryFilter: (searchParams.get('category') as ComponentCategory) || savedPreferences.categoryFilter || null,
      versionPreference: (searchParams.get('version') as ComponentVersion) || savedPreferences.versionPreference || 'css-modules',
      selectedVariant: searchParams.get('variant') || savedPreferences.selectedVariant || null,
      sidebarCollapsed: savedPreferences.sidebarCollapsed || false,
      activeTab: (searchParams.get('tab') as 'preview' | 'code' | 'dependencies' | 'accessibility') || 'preview'
    }
  })

  // Load component registry on mount
  useEffect(() => {
    const loadRegistry = async () => {
      try {
        setIsLoading(true)
        startTiming('component_registry_load')
        const registry = await createComponentRegistry()
        setComponentRegistry(registry)
        endTiming('component_registry_load', {
          componentCount: registry.components.length,
          categoriesCount: Object.keys(registry.stats.categoryCounts).length
        })
        recordInteraction('registry_loaded', undefined, { componentCount: registry.components.length })
      } catch (error) {
        console.error('Failed to load component registry:', error)
        endTiming('component_registry_load', { error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        setIsLoading(false)
      }
    }

    loadRegistry()
  }, [startTiming, endTiming, recordInteraction])

  // Get current component
  const currentComponent = useMemo(() => {
    if (!state.selectedComponent || !componentRegistry) return null
    return getComponentById(componentRegistry, state.selectedComponent)
  }, [state.selectedComponent, componentRegistry])

  // Update URL when state changes
  const updateURL = useCallback((newState: Partial<ShowcaseState>) => {
    const params = new URLSearchParams()

    const finalState = { ...state, ...newState }

    if (finalState.selectedComponent) {
      params.set('component', finalState.selectedComponent)
    }
    if (finalState.searchQuery) {
      params.set('search', finalState.searchQuery)
    }
    if (finalState.categoryFilter) {
      params.set('category', finalState.categoryFilter)
    }
    if (finalState.versionPreference !== 'css-modules') {
      params.set('version', finalState.versionPreference)
    }
    if (finalState.selectedVariant) {
      params.set('variant', finalState.selectedVariant)
    }
    if (finalState.activeTab !== 'preview') {
      params.set('tab', finalState.activeTab)
    }

    const url = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/components/showcase${url}`, { scroll: false })
  }, [state, router])

  // Save preferences to localStorage
  const savePreferences = useCallback((newState: ShowcaseState) => {
    if (typeof window !== 'undefined') {
      try {
        const preferencesToSave = {
          versionPreference: newState.versionPreference,
          sidebarCollapsed: newState.sidebarCollapsed,
          searchQuery: newState.searchQuery,
          categoryFilter: newState.categoryFilter
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencesToSave))
      } catch (error) {
        console.warn('Failed to save preferences:', error)
      }
    }
  }, [])

  // Update state and URL
  const updateState = useCallback((updates: Partial<ShowcaseState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates }
      updateURL(updates)
      savePreferences(newState)
      return newState
    })
  }, [updateURL, savePreferences])

  // Handle component selection
  const handleComponentSelect = useCallback((componentId: string) => {
    updateState({
      selectedComponent: componentId,
      selectedVariant: null, // Reset variant when changing components
      activeTab: 'preview'
    })
  }, [updateState])

  // Handle search
  const handleSearchChange = useCallback((query: string) => {
    updateState({ searchQuery: query })
  }, [updateState])

  // Handle category filter
  const handleCategoryFilterChange = useCallback((category: ComponentCategory | null) => {
    updateState({ categoryFilter: category })
  }, [updateState])

  // Handle version change
  const handleVersionChange = useCallback((version: ComponentVersion) => {
    updateState({ versionPreference: version })
  }, [updateState])

  // Handle variant change
  const handleVariantChange = useCallback((variant: string) => {
    updateState({ selectedVariant: variant })
  }, [updateState])

  // Handle tab change
  const handleTabChange = useCallback((tab: 'preview' | 'code' | 'dependencies' | 'accessibility') => {
    updateState({ activeTab: tab })
  }, [updateState])

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    updateState({ sidebarCollapsed: !state.sidebarCollapsed })
  }, [updateState, state.sidebarCollapsed])

  // Handle back navigation
  const handleBack = useCallback(() => {
    updateState({ selectedComponent: null, selectedVariant: null, activeTab: 'preview' })
  }, [updateState])

  // Focus search input
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    }
  }, [])

  // Navigate to next/previous component
  const navigateComponent = useCallback((direction: 'next' | 'previous') => {
    if (!componentRegistry || !state.selectedComponent) return

    const components = componentRegistry.components.sort((a, b) => a.name.localeCompare(b.name))
    const currentIndex = components.findIndex(c => c.id === state.selectedComponent)

    if (currentIndex === -1) return

    let nextIndex: number
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % components.length
    } else {
      nextIndex = currentIndex === 0 ? components.length - 1 : currentIndex - 1
    }

    handleComponentSelect(components[nextIndex].id)
    toast.success(`Navigated to ${components[nextIndex].name}`)
  }, [componentRegistry, state.selectedComponent, handleComponentSelect])

  // Copy current component code
  const copyCurrentCode = useCallback(async () => {
    if (!currentComponent) return

    try {
      // Get the current code from the active tab
      let codeToCopy = ''

      if (state.activeTab === 'code') {
        // Try to get code from the active code example
        const codeBlocks = document.querySelectorAll('pre code')
        if (codeBlocks.length > 0) {
          codeToCopy = (codeBlocks[0] as HTMLElement).textContent || ''
        }
      }

      if (codeToCopy) {
        await navigator.clipboard.writeText(codeToCopy)
        toast.success('Code copied to clipboard!')
      } else {
        toast.error('No code available to copy')
      }
    } catch (error) {
      console.error('Failed to copy code:', error)
      toast.error('Failed to copy code')
    }
  }, [currentComponent, state.activeTab])

  // Keyboard shortcuts
  const keyboardShortcuts: KeyboardShortcut[] = useMemo(() => [
    {
      key: '/',
      action: focusSearch,
      description: 'Focus search input'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: focusSearch,
      description: 'Focus search (Ctrl+K)'
    },
    {
      key: 'k',
      metaKey: true,
      action: focusSearch,
      description: 'Focus search (Cmd+K)'
    },
    {
      key: 'Escape',
      action: () => {
        if (state.selectedComponent) {
          handleBack()
        } else if (state.searchQuery) {
          handleSearchChange('')
        }
      },
      description: 'Go back or clear search'
    },
    {
      key: 'ArrowRight',
      altKey: true,
      action: () => navigateComponent('next'),
      description: 'Next component (Alt+→)'
    },
    {
      key: 'ArrowLeft',
      altKey: true,
      action: () => navigateComponent('previous'),
      description: 'Previous component (Alt+←)'
    },
    {
      key: '1',
      action: () => handleTabChange('preview'),
      description: 'Switch to Preview tab'
    },
    {
      key: '2',
      action: () => handleTabChange('code'),
      description: 'Switch to Code tab'
    },
    {
      key: '3',
      action: () => handleTabChange('dependencies'),
      description: 'Switch to Dependencies tab'
    },
    {
      key: '4',
      action: () => handleTabChange('accessibility'),
      description: 'Switch to Accessibility tab'
    },
    {
      key: 'c',
      ctrlKey: true,
      action: copyCurrentCode,
      description: 'Copy current code (Ctrl+C)'
    },
    {
      key: 'c',
      metaKey: true,
      action: copyCurrentCode,
      description: 'Copy current code (Cmd+C)'
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        handleSidebarToggle()
        toast.success(state.sidebarCollapsed ? 'Sidebar opened' : 'Sidebar closed')
      },
      description: 'Toggle sidebar (Ctrl+S)'
    },
    {
      key: 's',
      metaKey: true,
      action: () => {
        handleSidebarToggle()
        toast.success(state.sidebarCollapsed ? 'Sidebar opened' : 'Sidebar closed')
      },
      description: 'Toggle sidebar (Cmd+S)'
    },
    {
      key: '?',
      shiftKey: true,
      action: () => setShowKeyboardHelp(true),
      description: 'Show keyboard shortcuts'
    }
  ], [
    focusSearch,
    state.selectedComponent,
    state.searchQuery,
    state.sidebarCollapsed,
    handleBack,
    handleSearchChange,
    navigateComponent,
    handleTabChange,
    copyCurrentCode,
    handleSidebarToggle
  ])

  // Set up keyboard navigation
  const { containerRef } = useKeyboardNavigation({
    shortcuts: keyboardShortcuts,
    enableArrowNavigation: false, // We handle this manually for component navigation
    enableTabNavigation: true,
    enableEscapeHandling: false // We handle this in shortcuts
  })

  // Set up skip links
  const { skipLinksRef, addSkipLink } = useSkipLinks()

  // Add skip links on mount
  useEffect(() => {
    addSkipLink('main-content', 'Skip to main content')
    addSkipLink('sidebar', 'Skip to sidebar')
    addSkipLink('search-input', 'Skip to search')
  }, [addSkipLink])

  // Breadcrumb navigation
  const breadcrumbItems = useMemo(() => {
    const items = [
      {
        label: 'Components',
        href: '/components',
        icon: Home
      },
      {
        label: 'Showcase',
        href: currentComponent ? '/components/showcase' : null,
        isActive: !currentComponent
      }
    ]

    if (currentComponent) {
      items.push({
        label: currentComponent.name,
        href: null,
        isActive: true
      })
    }

    return items
  }, [currentComponent])

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((href: string) => {
    if (href === '/components/showcase') {
      handleBack()
    } else {
      router.push(href)
    }
  }, [handleBack, router])



  // Keyboard Help Modal Component
  const KeyboardHelpModal = () => (
    showKeyboardHelp && (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKeyboardHelp(false)}
                aria-label="Close keyboard shortcuts"
              >
                ×
              </Button>
            </div>

            <div className="grid gap-4">
              <div>
                <h3 className="font-medium mb-2">Navigation</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Focus search</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">/ or Ctrl+K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next component</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous component</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Alt+←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Go back / Clear search</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tabs</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Preview tab</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">1</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Code tab</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">2</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Dependencies tab</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">3</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Accessibility tab</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">4</kbd>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Actions</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Copy current code</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Toggle sidebar</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Show this help</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
              <p>Use Tab to navigate between interactive elements. All components maintain their original accessibility features.</p>
            </div>
          </div>
        </div>
      </div>
    )
  )

  return (
    <div ref={containerRef} className="flex min-h-screen bg-background">
      {/* Skip Links */}
      <div ref={skipLinksRef} className="sr-only" />

      {/* Keyboard Help Modal */}
      <KeyboardHelpModal />
      {/* Desktop Sidebar */}
      <aside
        id="sidebar"
        className={`hidden md:flex transition-all duration-300 ${state.sidebarCollapsed ? 'w-0' : 'w-80'}`}
        aria-label="Component navigation"
      >
        <div className={`${state.sidebarCollapsed ? 'hidden' : 'block'} w-80 border-r`}>
          {componentRegistry && (
            <ComponentSidebar
              componentRegistry={componentRegistry}
              selectedComponent={state.selectedComponent}
              onComponentSelect={handleComponentSelect}
              searchQuery={state.searchQuery}
              onSearchChange={handleSearchChange}
              categoryFilter={state.categoryFilter}
              onCategoryFilterChange={handleCategoryFilterChange}
              className="h-full"
            />
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4 ">
              {/* Mobile menu button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleSidebarToggle}
                className="md:hidden touch-manipulation"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Desktop sidebar toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSidebarToggle}
                className="hidden md:flex"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Breadcrumb Navigation */}
              <Breadcrumb aria-label="Page navigation">
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={`breadcrumb-${index}`}>
                      <BreadcrumbItem>
                        {item.href ? (
                          <BreadcrumbLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              handleBreadcrumbClick(item.href!)
                            }}
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                          >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="flex items-center gap-1">
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Back button for mobile */}
            {currentComponent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="md:hidden"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main id="main-content" className="flex-1 overflow-auto" role="main" aria-label="Component showcase content">
          {isLoading ? (
            // Loading State
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Component Showcase</h1>
                <p className="text-xl text-muted-foreground mb-6">Loading components...</p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            </div>
          ) : !componentRegistry ? (
            // Error State
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Component Showcase</h1>
                <p className="text-xl text-muted-foreground mb-6">Failed to load components. Please refresh the page.</p>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </div>
          ) : !currentComponent ? (
            // Welcome/Overview State
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4">Component Showcase</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    Explore and interact with our comprehensive collection of UI components
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary">
                      {componentRegistry.components.length} Components
                    </Badge>
                    <Badge variant="secondary">
                      {componentRegistry.stats.versionCounts.both} Dual Version
                    </Badge>
                    <Badge variant="secondary">
                      Interactive Examples
                    </Badge>
                    <Badge variant="secondary">
                      Copy-Paste Ready
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Object.entries(componentRegistry.stats.categoryCounts).map(([category, count]) => (
                    <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer touch-manipulation active:scale-95"
                      onClick={() => handleCategoryFilterChange(category as ComponentCategory)}>
                      <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                          <span className="capitalize">{category}</span>
                          <Badge variant="outline">{count}</Badge>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {category === 'basic' && 'Essential form controls and basic UI elements'}
                          {category === 'layout' && 'Components for structuring and organizing content'}
                          {category === 'feedback' && 'User feedback and notification components'}
                          {category === 'navigation' && 'Navigation and wayfinding components'}
                          {category === 'data' && 'Data display and manipulation components'}
                          {category === 'overlay' && 'Modal dialogs and overlay components'}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Select a component from the sidebar to get started, or use the search to find what you need.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => handleComponentSelect('button')}>
                      View Button Component
                    </Button>
                    <Button variant="outline" onClick={() => handleSearchChange('input')}>
                      Search Components
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Component Detail View
            <div className="container mx-auto py-6 px-4">
              <div className="max-w-6xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex items-center gap-1 mb-6 border-b">
                  <Button
                    variant={state.activeTab === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleTabChange('preview')}
                    className="rounded-b-none"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant={state.activeTab === 'code' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleTabChange('code')}
                    className="rounded-b-none"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                  <Button
                    variant={state.activeTab === 'dependencies' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleTabChange('dependencies')}
                    className="rounded-b-none"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Dependencies
                  </Button>
                  <Button
                    variant={state.activeTab === 'accessibility' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleTabChange('accessibility')}
                    className="rounded-b-none"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Accessibility
                  </Button>
                </div>

                {/* Tab Content with Lazy Loading */}
                <div className="space-y-6">
                  {state.activeTab === 'accessibility' ? (
                    <AccessibilityPanel
                      targetElement={document.querySelector('[data-component-preview]') as HTMLElement}
                      componentName={currentComponent.name}
                    />
                  ) : (
                    <LazyComponentLoader
                      component={currentComponent}
                      version={state.versionPreference}
                      activeTab={state.activeTab}
                      selectedVariant={state.selectedVariant}
                      onVariantChange={handleVariantChange}
                      onVersionChange={handleVersionChange}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}