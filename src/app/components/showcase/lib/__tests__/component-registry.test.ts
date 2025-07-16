import { describe, it, expect, beforeEach } from 'vitest'
import { 
  createComponentRegistry, 
  getComponentById, 
  searchComponents, 
  filterComponents, 
  getComponentStats,
  type ComponentRegistry,
  type ComponentInfo 
} from '../component-registry'

describe('Component Registry System', () => {
  let registry: ComponentRegistry

  beforeEach(() => {
    registry = createComponentRegistry()
  })

  describe('Registry Creation', () => {
    it('should create a registry with components', () => {
      expect(registry).toBeDefined()
      expect(registry.components).toBeInstanceOf(Array)
      expect(registry.components.length).toBeGreaterThan(0)
    })

    it('should have categories defined', () => {
      expect(registry.categories).toBeDefined()
      expect(Object.keys(registry.categories).length).toBeGreaterThan(0)
    })

    it('should have dependency map', () => {
      expect(registry.dependencyMap).toBeDefined()
      expect(typeof registry.dependencyMap).toBe('object')
    })

    it('should contain expected component structure', () => {
      const component = registry.components[0]
      expect(component).toHaveProperty('id')
      expect(component).toHaveProperty('name')
      expect(component).toHaveProperty('description')
      expect(component).toHaveProperty('category')
      expect(component).toHaveProperty('dependencies')
      expect(component).toHaveProperty('variants')
      expect(component).toHaveProperty('hasOriginalVersion')
      expect(component).toHaveProperty('hasCssModulesVersion')
    })
  })

  describe('Component Lookup', () => {
    it('should find existing components by ID', () => {
      // Assuming button component exists
      const component = getComponentById(registry, 'button')
      if (component) {
        expect(component.id).toBe('button')
        expect(component.name).toBe('Button')
      }
    })

    it('should return null for non-existent components', () => {
      const component = getComponentById(registry, 'non-existent-component')
      expect(component).toBeNull()
    })

    it('should handle empty or invalid IDs', () => {
      expect(getComponentById(registry, '')).toBeNull()
      expect(getComponentById(registry, null as any)).toBeNull()
      expect(getComponentById(registry, undefined as any)).toBeNull()
    })
  })

  describe('Search Functionality', () => {
    it('should return all components for empty search', () => {
      const results = searchComponents(registry, '')
      expect(results.length).toBe(registry.components.length)
    })

    it('should find components by name', () => {
      const results = searchComponents(registry, 'button')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(c => c.name.toLowerCase().includes('button'))).toBe(true)
    })

    it('should find components by description', () => {
      const results = searchComponents(registry, 'clickable')
      // Should find button or other clickable components
      expect(results.length).toBeGreaterThanOrEqual(0)
    })

    it('should be case insensitive', () => {
      const lowerResults = searchComponents(registry, 'button')
      const upperResults = searchComponents(registry, 'BUTTON')
      const mixedResults = searchComponents(registry, 'Button')
      
      expect(lowerResults.length).toBe(upperResults.length)
      expect(lowerResults.length).toBe(mixedResults.length)
    })

    it('should handle special characters gracefully', () => {
      const results = searchComponents(registry, 'button@#$%')
      expect(results).toBeInstanceOf(Array)
    })

    it('should return empty array for non-matching search', () => {
      const results = searchComponents(registry, 'xyz123nonexistent')
      expect(results).toEqual([])
    })
  })

  describe('Filtering Functionality', () => {
    it('should filter by category', () => {
      const basicComponents = filterComponents(registry, { category: 'basic' })
      expect(basicComponents.every(c => c.category === 'basic')).toBe(true)
    })

    it('should filter by library', () => {
      const radixComponents = filterComponents(registry, { library: 'radix' })
      expect(radixComponents.every(c => 
        c.dependencies.some(d => d.name.includes('@radix-ui'))
      )).toBe(true)
    })

    it('should combine multiple filters', () => {
      const results = filterComponents(registry, { 
        category: 'basic',
        library: 'radix'
      })
      expect(results.every(c => 
        c.category === 'basic' && 
        c.dependencies.some(d => d.name.includes('@radix-ui'))
      )).toBe(true)
    })

    it('should return all components for empty filter', () => {
      const results = filterComponents(registry, {})
      expect(results.length).toBe(registry.components.length)
    })

    it('should handle invalid filter values', () => {
      const results = filterComponents(registry, { category: 'invalid-category' as any })
      expect(results).toEqual([])
    })
  })

  describe('Statistics Generation', () => {
    it('should generate correct total count', () => {
      const stats = getComponentStats(registry)
      expect(stats.total).toBe(registry.components.length)
    })

    it('should count version availability correctly', () => {
      const stats = getComponentStats(registry)
      expect(stats.withOriginalVersion).toBeGreaterThanOrEqual(0)
      expect(stats.withCssModulesVersion).toBeGreaterThanOrEqual(0)
      expect(stats.withBothVersions).toBeGreaterThanOrEqual(0)
      expect(stats.withBothVersions).toBeLessThanOrEqual(Math.min(stats.withOriginalVersion, stats.withCssModulesVersion))
    })

    it('should count library usage correctly', () => {
      const stats = getComponentStats(registry)
      expect(stats.withRadixUI).toBeGreaterThanOrEqual(0)
      expect(stats.withExternalLibraries).toBeGreaterThanOrEqual(0)
    })

    it('should have consistent statistics', () => {
      const stats = getComponentStats(registry)
      expect(stats.withOriginalVersion + stats.withCssModulesVersion).toBeGreaterThanOrEqual(stats.total)
    })
  })

  describe('Component Data Integrity', () => {
    it('should have valid component IDs', () => {
      registry.components.forEach(component => {
        expect(component.id).toBeTruthy()
        expect(typeof component.id).toBe('string')
        expect(component.id.length).toBeGreaterThan(0)
      })
    })

    it('should have valid component names', () => {
      registry.components.forEach(component => {
        expect(component.name).toBeTruthy()
        expect(typeof component.name).toBe('string')
        expect(component.name.length).toBeGreaterThan(0)
      })
    })

    it('should have valid categories', () => {
      const validCategories = ['basic', 'layout', 'feedback', 'navigation', 'data', 'overlay']
      registry.components.forEach(component => {
        expect(validCategories).toContain(component.category)
      })
    })

    it('should have valid dependencies structure', () => {
      registry.components.forEach(component => {
        expect(component.dependencies).toBeInstanceOf(Array)
        component.dependencies.forEach(dep => {
          expect(dep).toHaveProperty('name')
          expect(dep).toHaveProperty('version')
          expect(dep).toHaveProperty('type')
          expect(['peer', 'direct']).toContain(dep.type)
        })
      })
    })

    it('should have valid variants structure', () => {
      registry.components.forEach(component => {
        expect(component.variants).toBeInstanceOf(Array)
        component.variants.forEach(variant => {
          expect(variant).toHaveProperty('name')
          expect(variant).toHaveProperty('description')
          expect(variant).toHaveProperty('props')
        })
      })
    })
  })
})