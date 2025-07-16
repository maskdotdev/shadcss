import { describe, it, expect, beforeEach } from 'vitest'
import { 
  AdvancedSearch,
  type SearchOptions,
  type SearchResult 
} from '../advanced-search'
import { createComponentRegistry, type ComponentRegistry } from '../component-registry'

describe('Advanced Search System', () => {
  let registry: ComponentRegistry
  let search: AdvancedSearch

  beforeEach(() => {
    registry = createComponentRegistry()
    search = new AdvancedSearch(registry.components)
  })

  describe('Search Index Creation', () => {
    it('should create search index successfully', () => {
      expect(search).toBeDefined()
      expect(search.getIndexSize()).toBeGreaterThan(0)
    })

    it('should index all components', () => {
      expect(search.getIndexSize()).toBe(registry.components.length)
    })
  })

  describe('Basic Search', () => {
    it('should find exact matches', () => {
      const results = search.search('button')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.component.name.toLowerCase() === 'button')).toBe(true)
    })

    it('should find partial matches', () => {
      const results = search.search('but')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.component.name.toLowerCase().includes('but'))).toBe(true)
    })

    it('should be case insensitive', () => {
      const lowerResults = search.search('button')
      const upperResults = search.search('BUTTON')
      const mixedResults = search.search('Button')
      
      expect(lowerResults.length).toBe(upperResults.length)
      expect(lowerResults.length).toBe(mixedResults.length)
    })

    it('should return empty array for no matches', () => {
      const results = search.search('nonexistentcomponent123')
      expect(results).toEqual([])
    })

    it('should handle empty search query', () => {
      const results = search.search('')
      expect(results.length).toBe(registry.components.length)
    })
  })

  describe('Search Scoring', () => {
    it('should score exact name matches higher', () => {
      const results = search.search('button')
      const exactMatch = results.find(r => r.component.name.toLowerCase() === 'button')
      const partialMatch = results.find(r => 
        r.component.name.toLowerCase().includes('button') && 
        r.component.name.toLowerCase() !== 'button'
      )
      
      if (exactMatch && partialMatch) {
        expect(exactMatch.score).toBeGreaterThan(partialMatch.score)
      }
    })

    it('should have scores between 0 and 1', () => {
      const results = search.search('button')
      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(1)
      })
    })

    it('should sort results by score descending', () => {
      const results = search.search('button')
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].score).toBeGreaterThanOrEqual(results[i].score)
      }
    })
  })

  describe('Advanced Search Options', () => {
    it('should filter by category', () => {
      const options: SearchOptions = { category: 'basic' }
      const results = search.search('', options)
      expect(results.every(r => r.component.category === 'basic')).toBe(true)
    })

    it('should filter by library', () => {
      const options: SearchOptions = { library: 'radix' }
      const results = search.search('', options)
      expect(results.every(r => 
        r.component.dependencies.some(d => d.name.includes('@radix-ui'))
      )).toBe(true)
    })

    it('should limit results', () => {
      const options: SearchOptions = { limit: 5 }
      const results = search.search('', options)
      expect(results.length).toBeLessThanOrEqual(5)
    })

    it('should combine search query with filters', () => {
      const options: SearchOptions = { category: 'basic' }
      const results = search.search('button', options)
      expect(results.every(r => 
        r.component.category === 'basic' &&
        (r.component.name.toLowerCase().includes('button') || 
         r.component.description.toLowerCase().includes('button'))
      )).toBe(true)
    })
  })

  describe('Search Performance', () => {
    it('should complete search within reasonable time', () => {
      const start = performance.now()
      search.search('button')
      const end = performance.now()
      
      // Should complete within 100ms for typical component count
      expect(end - start).toBeLessThan(100)
    })

    it('should handle large search queries efficiently', () => {
      const longQuery = 'a'.repeat(1000)
      const start = performance.now()
      search.search(longQuery)
      const end = performance.now()
      
      expect(end - start).toBeLessThan(200)
    })
  })

  describe('Search Result Structure', () => {
    it('should return properly structured results', () => {
      const results = search.search('button')
      results.forEach(result => {
        expect(result).toHaveProperty('component')
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('matchedFields')
        expect(result.matchedFields).toBeInstanceOf(Array)
      })
    })

    it('should identify matched fields correctly', () => {
      const results = search.search('button')
      const result = results.find(r => r.component.name.toLowerCase().includes('button'))
      
      if (result) {
        expect(result.matchedFields).toContain('name')
      }
    })
  })

  describe('Fuzzy Search', () => {
    it('should find components with typos', () => {
      const results = search.search('buton') // missing 't'
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle character transposition', () => {
      const results = search.search('buttno') // transposed 'o' and 'n'
      expect(results.length).toBeGreaterThan(0)
    })

    it('should handle extra characters', () => {
      const results = search.search('buttonn') // extra 'n'
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('Search Suggestions', () => {
    it('should provide search suggestions', () => {
      const suggestions = search.getSuggestions('but')
      expect(suggestions).toBeInstanceOf(Array)
      expect(suggestions.length).toBeGreaterThan(0)
    })

    it('should limit suggestions count', () => {
      const suggestions = search.getSuggestions('but', 3)
      expect(suggestions.length).toBeLessThanOrEqual(3)
    })

    it('should return relevant suggestions', () => {
      const suggestions = search.getSuggestions('but')
      expect(suggestions.some(s => s.toLowerCase().includes('but'))).toBe(true)
    })
  })

  describe('Search History', () => {
    it('should track search history', () => {
      search.search('button')
      search.search('card')
      
      const history = search.getSearchHistory()
      expect(history).toContain('button')
      expect(history).toContain('card')
    })

    it('should limit history size', () => {
      // Perform many searches
      for (let i = 0; i < 20; i++) {
        search.search(`query${i}`)
      }
      
      const history = search.getSearchHistory()
      expect(history.length).toBeLessThanOrEqual(10) // Assuming max 10 items
    })

    it('should clear search history', () => {
      search.search('button')
      search.clearSearchHistory()
      
      const history = search.getSearchHistory()
      expect(history.length).toBe(0)
    })
  })
})