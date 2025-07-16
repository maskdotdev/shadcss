/**
 * Integration tests for user workflows
 * These tests simulate complete user journeys through the component showcase
 */

import { createTestComponentRegistry as createComponentRegistry, getComponentById, searchComponents, filterComponents } from './test-component-registry'
import type { ComponentRegistry, ComponentInfo, FilterOptions } from '../types'

// Mock clipboard API for testing
const mockClipboard = {
  writeText: async (text: string) => {
    mockClipboard.lastCopiedText = text
    return Promise.resolve()
  },
  lastCopiedText: ''
}

// Mock window.navigator.clipboard
Object.defineProperty(global, 'navigator', {
  value: {
    clipboard: mockClipboard
  },
  writable: true
})

// Test utilities
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${expected}, got ${actual}`)
  }
}

function assertGreaterThan(actual: number, expected: number, message: string) {
  if (actual <= expected) {
    throw new Error(`Assertion failed: ${message}. Expected ${actual} > ${expected}`)
  }
}

function assertContains<T>(array: T[], item: T, message: string) {
  if (!array.includes(item)) {
    throw new Error(`Assertion failed: ${message}. Array does not contain ${item}`)
  }
}

// Simulate user interactions
class UserWorkflowSimulator {
  private registry: ComponentRegistry
  private currentComponent: ComponentInfo | null = null
  private searchQuery: string = ''
  private activeFilters: FilterOptions = {}
  private searchResults: ComponentInfo[] = []
  private filteredResults: ComponentInfo[] = []

  constructor(registry: ComponentRegistry) {
    this.registry = registry
    this.filteredResults = registry.components
  }

  // User searches for a component
  search(query: string): ComponentInfo[] {
    this.searchQuery = query
    this.searchResults = searchComponents(this.registry, query)
    this.applyFiltersToSearchResults()
    return this.searchResults
  }

  // User applies filters
  applyFilter(filter: FilterOptions): ComponentInfo[] {
    this.activeFilters = { ...this.activeFilters, ...filter }
    this.filteredResults = filterComponents(this.registry, this.activeFilters)
    this.applyFiltersToSearchResults()
    return this.filteredResults
  }

  // User clears filters
  clearFilters(): ComponentInfo[] {
    this.activeFilters = {}
    this.filteredResults = this.registry.components
    this.applyFiltersToSearchResults()
    return this.filteredResults
  }

  // User selects a component
  selectComponent(componentId: string): ComponentInfo | null {
    this.currentComponent = getComponentById(this.registry, componentId)
    return this.currentComponent
  }

  // User copies code
  async copyCode(code: string): Promise<boolean> {
    try {
      await mockClipboard.writeText(code)
      return true
    } catch {
      return false
    }
  }

  // Get current state
  getCurrentState() {
    return {
      currentComponent: this.currentComponent,
      searchQuery: this.searchQuery,
      activeFilters: this.activeFilters,
      searchResults: this.searchResults,
      filteredResults: this.filteredResults
    }
  }

  private applyFiltersToSearchResults() {
    if (this.searchQuery) {
      // Apply filters to search results
      this.searchResults = this.searchResults.filter(component => {
        return this.filteredResults.includes(component)
      })
    } else {
      this.searchResults = this.filteredResults
    }
  }
}

export async function runIntegrationWorkflowTests() {
  console.log('🔄 Running Integration Workflow Tests...\n')
  
  let passed = 0
  let failed = 0

  function test(name: string, fn: () => void | Promise<void>) {
    return async () => {
      try {
        await fn()
        console.log(`✅ ${name}`)
        passed++
      } catch (error) {
        console.log(`❌ ${name}`)
        console.log(`   Error: ${error.message}`)
        failed++
      }
    }
  }

  // Setup
  const registry = await createComponentRegistry()
  let simulator: UserWorkflowSimulator

  // Workflow 1: Basic Component Discovery
  await test('Workflow 1: User discovers components through browsing', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User starts with all components visible
    const state = simulator.getCurrentState()
    assertEqual(state.filteredResults.length, registry.components.length, 'Should show all components initially')
    
    // User browses basic components
    const basicComponents = simulator.applyFilter({ category: 'basic' })
    assertGreaterThan(basicComponents.length, 0, 'Should find basic components')
    assert(basicComponents.every(c => c.category === 'basic'), 'All results should be basic category')
    
    // User selects button component
    const buttonComponent = simulator.selectComponent('button')
    assert(buttonComponent !== null, 'Should find button component')
    assertEqual(buttonComponent!.id, 'button', 'Should select correct component')
  })()

  // Workflow 2: Search-Driven Discovery
  await test('Workflow 2: User finds components through search', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User searches for "button"
    const searchResults = simulator.search('button')
    assertGreaterThan(searchResults.length, 0, 'Should find button-related components')
    assert(searchResults.some(c => c.name.toLowerCase().includes('button')), 'Should include button component')
    
    // User refines search with filters
    simulator.applyFilter({ category: 'basic' })
    const refinedResults = simulator.getCurrentState().searchResults
    assert(refinedResults.every(c => c.category === 'basic'), 'Filtered search should only show basic components')
    
    // User selects a component from search results
    const selectedComponent = simulator.selectComponent(searchResults[0].id)
    assert(selectedComponent !== null, 'Should be able to select component from search results')
  })()

  // Workflow 3: Filter-Based Exploration
  await test('Workflow 3: User explores components using filters', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User filters by Radix UI components
    const radixComponents = simulator.applyFilter({ library: 'radix' })
    assertGreaterThan(radixComponents.length, 0, 'Should find Radix UI components')
    assert(radixComponents.every(c => 
      c.dependencies.some(d => d.name.includes('@radix-ui'))
    ), 'All results should use Radix UI')
    
    // User adds category filter
    simulator.applyFilter({ category: 'overlay' })
    const overlayRadixComponents = simulator.getCurrentState().filteredResults
    assert(overlayRadixComponents.every(c => 
      c.category === 'overlay' && c.dependencies.some(d => d.name.includes('@radix-ui'))
    ), 'Should show only overlay components using Radix UI')
    
    // User clears filters
    const allComponents = simulator.clearFilters()
    assertEqual(allComponents.length, registry.components.length, 'Should show all components after clearing filters')
  })()

  // Workflow 4: Component Version Comparison
  await test('Workflow 4: User compares component versions', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User filters for components with both versions
    const bothVersionsComponents = simulator.applyFilter({ 
      hasOriginalVersion: true, 
      hasCssModulesVersion: true 
    })
    assertGreaterThan(bothVersionsComponents.length, 0, 'Should find components with both versions')
    assert(bothVersionsComponents.every(c => 
      c.hasOriginalVersion && c.hasCssModulesVersion
    ), 'All results should have both versions')
    
    // User selects a component to compare versions
    const componentToCompare = simulator.selectComponent(bothVersionsComponents[0].id)
    assert(componentToCompare !== null, 'Should select component for comparison')
    assert(componentToCompare!.hasOriginalVersion, 'Selected component should have original version')
    assert(componentToCompare!.hasCssModulesVersion, 'Selected component should have CSS modules version')
  })()

  // Workflow 5: Code Copying Workflow
  await test('Workflow 5: User copies component code', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User finds and selects a component
    const buttonComponent = simulator.selectComponent('button')
    assert(buttonComponent !== null, 'Should find button component')
    
    // User copies basic usage code
    const basicCode = `<Button variant="default">Click me</Button>`
    const copySuccess = await simulator.copyCode(basicCode)
    assert(copySuccess, 'Should successfully copy code')
    assertEqual(mockClipboard.lastCopiedText, basicCode, 'Should copy correct code to clipboard')
    
    // User copies variant code
    const variantCode = `<Button variant="secondary">Secondary</Button>`
    await simulator.copyCode(variantCode)
    assertEqual(mockClipboard.lastCopiedText, variantCode, 'Should copy variant code to clipboard')
  })()

  // Workflow 6: Complex Search and Filter Combination
  await test('Workflow 6: User combines search with multiple filters', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User starts with a broad search
    simulator.search('component')
    const initialResults = simulator.getCurrentState().searchResults
    assertGreaterThan(initialResults.length, 0, 'Should find components with broad search')
    
    // User applies category filter
    simulator.applyFilter({ category: 'basic' })
    const categoryFiltered = simulator.getCurrentState().searchResults
    assert(categoryFiltered.length <= initialResults.length, 'Filter should reduce or maintain results')
    assert(categoryFiltered.every(c => c.category === 'basic'), 'Should only show basic components')
    
    // User applies version filter
    simulator.applyFilter({ hasOriginalVersion: true })
    const versionFiltered = simulator.getCurrentState().searchResults
    assert(versionFiltered.length <= categoryFiltered.length, 'Additional filter should reduce or maintain results')
    assert(versionFiltered.every(c => c.hasOriginalVersion), 'Should only show components with original version')
    
    // User clears search but keeps filters
    simulator.search('')
    const noSearchWithFilters = simulator.getCurrentState().filteredResults
    assert(noSearchWithFilters.every(c => 
      c.category === 'basic' && c.hasOriginalVersion
    ), 'Should maintain filters after clearing search')
  })()

  // Workflow 7: Error Handling and Edge Cases
  await test('Workflow 7: System handles edge cases gracefully', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // User searches for non-existent component
    const noResults = simulator.search('nonexistentcomponent123')
    assertEqual(noResults.length, 0, 'Should return empty results for non-existent component')
    
    // User tries to select non-existent component
    const nonExistentComponent = simulator.selectComponent('non-existent-id')
    assertEqual(nonExistentComponent, null, 'Should return null for non-existent component')
    
    // User applies invalid filter
    const invalidFilter = simulator.applyFilter({ category: 'invalid-category' as any })
    assertEqual(invalidFilter.length, 0, 'Should return empty results for invalid filter')
    
    // User searches with special characters
    const specialCharResults = simulator.search('button@#$%')
    assert(Array.isArray(specialCharResults), 'Should handle special characters gracefully')
    
    // User searches with empty string
    const emptySearchResults = simulator.search('')
    assertEqual(emptySearchResults.length, registry.components.length, 'Empty search should return all components')
  })()

  // Workflow 8: State Management Consistency
  await test('Workflow 8: State remains consistent throughout interactions', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    // Perform a series of operations
    simulator.search('button')
    simulator.applyFilter({ category: 'basic' })
    const component = simulator.selectComponent('button')
    simulator.applyFilter({ hasOriginalVersion: true })
    
    const finalState = simulator.getCurrentState()
    
    // Verify state consistency
    assertEqual(finalState.searchQuery, 'button', 'Search query should be maintained')
    assertEqual(finalState.currentComponent, component, 'Selected component should be maintained')
    assert(finalState.activeFilters.category === 'basic', 'Category filter should be maintained')
    assert(finalState.activeFilters.hasOriginalVersion === true, 'Version filter should be maintained')
    
    // Verify results are consistent with state
    assert(finalState.searchResults.every(c => 
      c.category === 'basic' && 
      c.hasOriginalVersion &&
      (c.name.toLowerCase().includes('button') || c.description.toLowerCase().includes('button'))
    ), 'Results should match all applied filters and search')
  })()

  // Workflow 9: Performance Under Load
  await test('Workflow 9: System performs well with multiple operations', async () => {
    simulator = new UserWorkflowSimulator(registry)
    
    const startTime = performance.now()
    
    // Perform many operations quickly
    for (let i = 0; i < 100; i++) {
      simulator.search(`test${i % 10}`)
      simulator.applyFilter({ category: i % 2 === 0 ? 'basic' : 'layout' })
      simulator.clearFilters()
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Should complete within reasonable time (1 second for 100 operations)
    assert(duration < 1000, `Operations should complete quickly (took ${duration}ms)`)
  })()

  // Summary
  console.log('\n📊 Integration Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  return failed === 0
}

export default runIntegrationWorkflowTests