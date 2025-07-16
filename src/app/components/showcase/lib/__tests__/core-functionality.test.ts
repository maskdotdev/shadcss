/**
 * Core functionality tests that don't require React components
 * These tests validate the business logic and data processing
 */

// Mock the component examples to avoid React/CSS imports
const mockComponentExamples = {
  getComponentExamples: () => ({
    button: [
      {
        title: 'Basic Button',
        description: 'A simple button example',
        code: '<Button>Click me</Button>',
        component: null
      }
    ]
  })
}

// Mock the API route
global.fetch = async (url: string) => {
  if (url.includes('/api/components/discovery')) {
    return {
      ok: true,
      json: async () => ({
        components: [
          {
            id: 'button',
            name: 'Button',
            description: 'A clickable button component',
            category: 'basic',
            dependencies: [
              {
                name: '@radix-ui/react-slot',
                version: '^1.2.3',
                type: 'direct',
                description: 'Slot functionality',
                installCommand: 'npm install @radix-ui/react-slot'
              }
            ],
            variants: [
              { name: 'default', description: 'Default variant', props: {} },
              { name: 'secondary', description: 'Secondary variant', props: { variant: 'secondary' } }
            ],
            hasOriginalVersion: true,
            hasCssModulesVersion: true
          },
          {
            id: 'card',
            name: 'Card',
            description: 'A card container component',
            category: 'layout',
            dependencies: [],
            variants: [],
            hasOriginalVersion: true,
            hasCssModulesVersion: true
          }
        ]
      })
    } as Response
  }
  throw new Error('Unknown API endpoint')
}

// Test functions
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

function assertInstanceOf(actual: any, expected: any, message: string) {
  if (!(actual instanceof expected)) {
    throw new Error(`Assertion failed: ${message}. Expected instance of ${expected.name}`)
  }
}

// Import the test functions
import { createTestComponentRegistry as createComponentRegistry, getComponentById, searchComponents, filterComponents, getComponentStats } from './test-component-registry'

export async function runCoreTests() {
  console.log('🧪 Running Core Functionality Tests...\n')
  
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

  // Test 1: Registry Creation
  await test('Registry Creation', async () => {
    const registry = await createComponentRegistry()
    assert(registry !== null && registry !== undefined, 'Registry should be created')
    assertInstanceOf(registry.components, Array, 'Components should be an array')
    assertGreaterThan(registry.components.length, 0, 'Should have components')
  })()

  // Create registry for other tests
  const registry = await createComponentRegistry()

  // Test 2: Component Lookup
  await test('Component Lookup - Existing Component', async () => {
    const component = getComponentById(registry, 'button')
    assert(component !== null, 'Should find button component')
    if (component) {
      assertEqual(component.id, 'button', 'Component ID should match')
      assertEqual(component.name, 'Button', 'Component name should match')
    }
  })()

  await test('Component Lookup - Non-existent Component', async () => {
    const component = getComponentById(registry, 'non-existent')
    assertEqual(component, null, 'Should return null for non-existent component')
  })()

  // Test 3: Search Functionality
  await test('Search - Basic Search', async () => {
    const results = searchComponents(registry, 'button')
    assertInstanceOf(results, Array, 'Search results should be an array')
    assert(results.length > 0, 'Should find button components')
  })()

  await test('Search - Empty Query', async () => {
    const results = searchComponents(registry, '')
    assertEqual(results.length, registry.components.length, 'Empty search should return all components')
  })()

  await test('Search - Case Insensitive', async () => {
    const lowerResults = searchComponents(registry, 'button')
    const upperResults = searchComponents(registry, 'BUTTON')
    assertEqual(lowerResults.length, upperResults.length, 'Search should be case insensitive')
  })()

  await test('Search - No Results', async () => {
    const results = searchComponents(registry, 'nonexistentcomponent123')
    assertEqual(results.length, 0, 'Should return empty array for no matches')
  })()

  // Test 4: Filtering
  await test('Filter - By Category', async () => {
    const results = filterComponents(registry, { category: 'basic' })
    assertInstanceOf(results, Array, 'Filter results should be an array')
    results.forEach(component => {
      assertEqual(component.category, 'basic', 'All results should be basic category')
    })
  })()

  await test('Filter - Empty Filter', async () => {
    const results = filterComponents(registry, {})
    assertEqual(results.length, registry.components.length, 'Empty filter should return all components')
  })()

  await test('Filter - Invalid Category', async () => {
    const results = filterComponents(registry, { category: 'invalid-category' as any })
    assertEqual(results.length, 0, 'Invalid category should return empty array')
  })()

  // Test 5: Statistics
  await test('Statistics Generation', async () => {
    const stats = getComponentStats(registry)
    assertEqual(stats.total, registry.components.length, 'Total should match component count')
    assert(stats.withOriginalVersion >= 0, 'Original version count should be non-negative')
    assert(stats.withCssModulesVersion >= 0, 'CSS modules version count should be non-negative')
    assert(stats.withBothVersions >= 0, 'Both versions count should be non-negative')
  })()

  // Test 6: Data Integrity
  await test('Data Integrity - Component Structure', async () => {
    registry.components.forEach((component, index) => {
      assert(typeof component.id === 'string' && component.id.length > 0, `Component ${index} should have valid ID`)
      assert(typeof component.name === 'string' && component.name.length > 0, `Component ${index} should have valid name`)
      assert(typeof component.description === 'string', `Component ${index} should have description`)
      assert(['basic', 'layout', 'feedback', 'navigation', 'data', 'overlay'].includes(component.category), `Component ${index} should have valid category`)
      assertInstanceOf(component.dependencies, Array, `Component ${index} dependencies should be array`)
      assertInstanceOf(component.variants, Array, `Component ${index} variants should be array`)
    })
  })()

  await test('Data Integrity - Dependencies Structure', async () => {
    registry.components.forEach((component, index) => {
      component.dependencies.forEach((dep, depIndex) => {
        assert(typeof dep.name === 'string' && dep.name.length > 0, `Component ${index} dependency ${depIndex} should have valid name`)
        assert(typeof dep.version === 'string' && dep.version.length > 0, `Component ${index} dependency ${depIndex} should have valid version`)
        assert(['peer', 'direct'].includes(dep.type), `Component ${index} dependency ${depIndex} should have valid type`)
      })
    })
  })()

  await test('Data Integrity - Variants Structure', async () => {
    registry.components.forEach((component, index) => {
      component.variants.forEach((variant, variantIndex) => {
        assert(typeof variant.name === 'string' && variant.name.length > 0, `Component ${index} variant ${variantIndex} should have valid name`)
        assert(typeof variant.description === 'string', `Component ${index} variant ${variantIndex} should have description`)
        assert(typeof variant.props === 'object', `Component ${index} variant ${variantIndex} should have props object`)
      })
    })
  })()

  // Summary
  console.log('\n📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  return failed === 0
}

// Export for use in test runner
export default runCoreTests