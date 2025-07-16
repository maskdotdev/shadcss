#!/usr/bin/env node

// Simple test runner to validate our core functionality
import { createComponentRegistry, getComponentById, searchComponents, filterComponents, getComponentStats } from './src/app/components/showcase/lib/component-registry.js'

console.log('🧪 Running Component Showcase Tests...\n')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`✅ ${name}`)
    passed++
  } catch (error) {
    console.log(`❌ ${name}`)
    console.log(`   Error: ${error.message}`)
    failed++
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`)
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`)
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`)
      }
    },
    toContain: (expected) => {
      if (!actual.includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`)
      }
    },
    toBeInstanceOf: (expected) => {
      if (!(actual instanceof expected)) {
        throw new Error(`Expected ${actual} to be instance of ${expected.name}`)
      }
    }
  }
}

// Test Component Registry
try {
  console.log('📋 Testing Component Registry System...')
  
  test('Registry Creation', () => {
    const registry = createComponentRegistry()
    expect(registry).toBeTruthy()
    expect(registry.components).toBeInstanceOf(Array)
    expect(registry.components.length).toBeGreaterThan(0)
  })

  const registry = createComponentRegistry()

  test('Component Lookup', () => {
    const component = getComponentById(registry, 'button')
    if (component) {
      expect(component.id).toBe('button')
    }
  })

  test('Search Functionality', () => {
    const results = searchComponents(registry, 'button')
    expect(results).toBeInstanceOf(Array)
  })

  test('Filter Functionality', () => {
    const results = filterComponents(registry, { category: 'basic' })
    expect(results).toBeInstanceOf(Array)
  })

  test('Statistics Generation', () => {
    const stats = getComponentStats(registry)
    expect(stats.total).toBe(registry.components.length)
  })

  console.log('\n📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  if (failed === 0) {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  } else {
    console.log('\n💥 Some tests failed!')
    process.exit(1)
  }

} catch (error) {
  console.error('💥 Test runner failed:', error.message)
  process.exit(1)
}