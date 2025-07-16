import { describe, it, expect, beforeEach } from 'vitest'
import { 
  FilteringSystem,
  type FilterOptions,
  type FilterState 
} from '../filtering-system'
import { createComponentRegistry, type ComponentRegistry } from '../component-registry'

describe('Filtering System', () => {
  let registry: ComponentRegistry
  let filteringSystem: FilteringSystem

  beforeEach(() => {
    registry = createComponentRegistry()
    filteringSystem = new FilteringSystem(registry.components)
  })

  describe('Filter System Initialization', () => {
    it('should initialize with all components', () => {
      expect(filteringSystem).toBeDefined()
      expect(filteringSystem.getAllComponents().length).toBe(registry.components.length)
    })

    it('should have available filter options', () => {
      const options = filteringSystem.getAvailableFilters()
      expect(options).toHaveProperty('categories')
      expect(options).toHaveProperty('libraries')
      expect(options.categories.length).toBeGreaterThan(0)
    })
  })

  describe('Category Filtering', () => {
    it('should filter by single category', () => {
      const results = filteringSystem.applyFilters({ categories: ['basic'] })
      expect(results.every(c => c.category === 'basic')).toBe(true)
    })

    it('should filter by multiple categories', () => {
      const results = filteringSystem.applyFilters({ categories: ['basic', 'layout'] })
      expect(results.every(c => ['basic', 'layout'].includes(c.category))).toBe(true)
    })

    it('should return empty array for invalid category', () => {
      const results = filteringSystem.applyFilters({ categories: ['invalid-category'] })
      expect(results).toEqual([])
    })

    it('should handle empty category array', () => {
      const results = filteringSystem.applyFilters({ categories: [] })
      expect(results.length).toBe(registry.components.length)
    })
  })

  describe('Library Filtering', () => {
    it('should filter by Radix UI components', () => {
      const results = filteringSystem.applyFilters({ libraries: ['radix'] })
      expect(results.every(c => 
        c.dependencies.some(d => d.name.includes('@radix-ui'))
      )).toBe(true)
    })

    it('should filter by external libraries', () => {
      const results = filteringSystem.applyFilters({ libraries: ['cmdk'] })
      expect(results.every(c => 
        c.dependencies.some(d => d.name.includes('cmdk')) ||
        c.externalLibraries?.includes('cmdk')
      )).toBe(true)
    })

    it('should filter by multiple libraries', () => {
      const results = filteringSystem.applyFilters({ libraries: ['radix', 'cmdk'] })
      expect(results.every(c => 
        c.dependencies.some(d => d.name.includes('@radix-ui') || d.name.includes('cmdk')) ||
        c.externalLibraries?.some(lib => ['radix', 'cmdk'].includes(lib))
      )).toBe(true)
    })
  })

  describe('Version Filtering', () => {
    it('should filter components with original version', () => {
      const results = filteringSystem.applyFilters({ hasOriginalVersion: true })
      expect(results.every(c => c.hasOriginalVersion)).toBe(true)
    })

    it('should filter components with CSS modules version', () => {
      const results = filteringSystem.applyFilters({ hasCssModulesVersion: true })
      expect(results.every(c => c.hasCssModulesVersion)).toBe(true)
    })

    it('should filter components with both versions', () => {
      const results = filteringSystem.applyFilters({ 
        hasOriginalVersion: true,
        hasCssModulesVersion: true 
      })
      expect(results.every(c => c.hasOriginalVersion && c.hasCssModulesVersion)).toBe(true)
    })
  })

  describe('Combined Filtering', () => {
    it('should apply multiple filters simultaneously', () => {
      const results = filteringSystem.applyFilters({
        categories: ['basic'],
        hasOriginalVersion: true
      })
      expect(results.every(c => 
        c.category === 'basic' && c.hasOriginalVersion
      )).toBe(true)
    })

    it('should handle complex filter combinations', () => {
      const results = filteringSystem.applyFilters({
        categories: ['basic', 'layout'],
        libraries: ['radix'],
        hasCssModulesVersion: true
      })
      expect(results.every(c => 
        ['basic', 'layout'].includes(c.category) &&
        c.dependencies.some(d => d.name.includes('@radix-ui')) &&
        c.hasCssModulesVersion
      )).toBe(true)
    })

    it('should return empty array when filters conflict', () => {
      // Filter for components that don't exist
      const results = filteringSystem.applyFilters({
        categories: ['basic'],
        libraries: ['nonexistent-library']
      })
      expect(results.length).toBe(0)
    })
  })

  describe('Filter State Management', () => {
    it('should track active filters', () => {
      const filters: FilterOptions = { categories: ['basic'], libraries: ['radix'] }
      filteringSystem.applyFilters(filters)
      
      const activeFilters = filteringSystem.getActiveFilters()
      expect(activeFilters.categories).toEqual(['basic'])
      expect(activeFilters.libraries).toEqual(['radix'])
    })

    it('should clear all filters', () => {
      filteringSystem.applyFilters({ categories: ['basic'] })
      filteringSystem.clearAllFilters()
      
      const activeFilters = filteringSystem.getActiveFilters()
      expect(activeFilters.categories).toEqual([])
      expect(activeFilters.libraries).toEqual([])
    })

    it('should remove specific filters', () => {
      filteringSystem.applyFilters({ 
        categories: ['basic', 'layout'],
        libraries: ['radix'] 
      })
      filteringSystem.removeFilter('categories', 'basic')
      
      const activeFilters = filteringSystem.getActiveFilters()
      expect(activeFilters.categories).toEqual(['layout'])
      expect(activeFilters.libraries).toEqual(['radix'])
    })
  })

  describe('Filter Statistics', () => {
    it('should provide filter statistics', () => {
      const stats = filteringSystem.getFilterStats()
      expect(stats).toHaveProperty('totalComponents')
      expect(stats).toHaveProperty('categoryCounts')
      expect(stats).toHaveProperty('libraryCounts')
      expect(stats.totalComponents).toBe(registry.components.length)
    })

    it('should have accurate category counts', () => {
      const stats = filteringSystem.getFilterStats()
      const basicCount = registry.components.filter(c => c.category === 'basic').length
      expect(stats.categoryCounts.basic).toBe(basicCount)
    })

    it('should update stats after filtering', () => {
      filteringSystem.applyFilters({ categories: ['basic'] })
      const stats = filteringSystem.getFilterStats()
      expect(stats.totalComponents).toBeLessThanOrEqual(registry.components.length)
    })
  })

  describe('Filter Performance', () => {
    it('should filter components efficiently', () => {
      const start = performance.now()
      filteringSystem.applyFilters({ categories: ['basic'] })
      const end = performance.now()
      
      // Should complete within 50ms for typical component count
      expect(end - start).toBeLessThan(50)
    })

    it('should handle complex filters efficiently', () => {
      const start = performance.now()
      filteringSystem.applyFilters({
        categories: ['basic', 'layout', 'feedback'],
        libraries: ['radix', 'cmdk'],
        hasOriginalVersion: true,
        hasCssModulesVersion: true
      })
      const end = performance.now()
      
      expect(end - start).toBeLessThan(100)
    })
  })

  describe('Filter Validation', () => {
    it('should validate filter options', () => {
      const isValid = filteringSystem.validateFilters({ categories: ['basic'] })
      expect(isValid).toBe(true)
    })

    it('should reject invalid filter options', () => {
      const isValid = filteringSystem.validateFilters({ categories: ['invalid'] })
      expect(isValid).toBe(false)
    })

    it('should handle malformed filter objects', () => {
      const isValid = filteringSystem.validateFilters({ invalidProperty: 'value' } as any)
      expect(isValid).toBe(false)
    })
  })

  describe('Filter Persistence', () => {
    it('should serialize filter state', () => {
      filteringSystem.applyFilters({ categories: ['basic'], libraries: ['radix'] })
      const serialized = filteringSystem.serializeFilters()
      
      expect(typeof serialized).toBe('string')
      expect(serialized.length).toBeGreaterThan(0)
    })

    it('should deserialize filter state', () => {
      const originalFilters = { categories: ['basic'], libraries: ['radix'] }
      filteringSystem.applyFilters(originalFilters)
      const serialized = filteringSystem.serializeFilters()
      
      filteringSystem.clearAllFilters()
      filteringSystem.deserializeFilters(serialized)
      
      const restoredFilters = filteringSystem.getActiveFilters()
      expect(restoredFilters.categories).toEqual(originalFilters.categories)
      expect(restoredFilters.libraries).toEqual(originalFilters.libraries)
    })

    it('should handle invalid serialized data gracefully', () => {
      expect(() => {
        filteringSystem.deserializeFilters('invalid-json')
      }).not.toThrow()
    })
  })
})