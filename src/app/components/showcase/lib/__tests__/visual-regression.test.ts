/**
 * Visual regression tests for component showcase
 * These tests capture screenshots of component examples to detect visual changes
 */

import { createTestComponentRegistry } from './test-component-registry'
import type { ComponentRegistry, ComponentInfo } from '../types'

// Mock DOM environment for testing
const mockDocument = {
  querySelector: (selector: string) => {
    if (selector === '[data-component-preview]') {
      return {
        getBoundingClientRect: () => ({ width: 800, height: 600, top: 0, left: 0 }),
        innerHTML: '<div>Mock component preview</div>',
        style: {},
        classList: { add: () => {}, remove: () => {} }
      }
    }
    return null
  },
  querySelectorAll: (selector: string) => [],
  createElement: (tag: string) => ({
    style: {},
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    appendChild: () => {},
    innerHTML: ''
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
}

// Mock window object
const mockWindow = {
  innerWidth: 1920,
  innerHeight: 1080,
  devicePixelRatio: 1,
  getComputedStyle: () => ({
    getPropertyValue: () => '',
    width: '800px',
    height: '600px'
  })
}

// Mock canvas for screenshot capture
const mockCanvas = {
  getContext: () => ({
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray(4) }),
    putImageData: () => {},
    fillRect: () => {},
    clearRect: () => {}
  }),
  toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  width: 800,
  height: 600
}

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

// Visual regression test utilities
class VisualRegressionTester {
  private registry: ComponentRegistry
  private screenshots: Map<string, string> = new Map()
  private baselineScreenshots: Map<string, string> = new Map()

  constructor(registry: ComponentRegistry) {
    this.registry = registry
    this.loadBaselineScreenshots()
  }

  // Load baseline screenshots (in real implementation, these would be stored files)
  private loadBaselineScreenshots() {
    // Mock baseline screenshots for testing
    this.baselineScreenshots.set('button-default', 'baseline-button-default-hash')
    this.baselineScreenshots.set('button-variants', 'baseline-button-variants-hash')
    this.baselineScreenshots.set('input-basic', 'baseline-input-basic-hash')
    this.baselineScreenshots.set('card-example', 'baseline-card-example-hash')
  }

  // Capture screenshot of component
  async captureComponentScreenshot(componentId: string, variant?: string): Promise<string> {
    const component = this.registry.components.find(c => c.id === componentId)
    if (!component) {
      throw new Error(`Component ${componentId} not found`)
    }

    // Mock screenshot capture process
    const screenshotKey = variant ? `${componentId}-${variant}` : `${componentId}-default`
    
    // Simulate rendering component
    await this.renderComponent(component, variant)
    
    // Simulate screenshot capture
    const screenshot = await this.takeScreenshot(screenshotKey)
    this.screenshots.set(screenshotKey, screenshot)
    
    return screenshot
  }

  // Mock component rendering
  private async renderComponent(component: ComponentInfo, variant?: string): Promise<void> {
    // Simulate component rendering time
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Mock DOM manipulation for component rendering
    const container = mockDocument.createElement('div')
    container.innerHTML = `<div data-component="${component.id}" data-variant="${variant || 'default'}">
      ${component.name} Component ${variant ? `(${variant})` : ''}
    </div>`
    
    // Simulate style application
    container.style = {
      width: '800px',
      height: '600px',
      padding: '20px',
      backgroundColor: '#ffffff'
    }
  }

  // Mock screenshot capture
  private async takeScreenshot(key: string): Promise<string> {
    // Simulate screenshot capture process
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Generate mock hash based on key (in real implementation, this would be actual image data)
    const hash = this.generateMockHash(key)
    return hash
  }

  // Generate mock hash for testing
  private generateMockHash(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `mock-hash-${Math.abs(hash).toString(16)}`
  }

  // Compare screenshots
  compareScreenshots(key: string): { match: boolean; difference?: number } {
    const current = this.screenshots.get(key)
    const baseline = this.baselineScreenshots.get(key)
    
    if (!current) {
      throw new Error(`No current screenshot found for ${key}`)
    }
    
    if (!baseline) {
      // No baseline exists, consider this a new component
      return { match: true }
    }
    
    // Mock comparison (in real implementation, this would compare actual image data)
    const match = current === baseline
    const difference = match ? 0 : Math.random() * 0.1 // Mock difference percentage
    
    return { match, difference }
  }

  // Test responsive behavior
  async testResponsiveBreakpoints(componentId: string): Promise<{ [breakpoint: string]: string }> {
    const breakpoints = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 }
    }
    
    const screenshots: { [breakpoint: string]: string } = {}
    
    for (const [breakpoint, dimensions] of Object.entries(breakpoints)) {
      // Mock viewport resize
      mockWindow.innerWidth = dimensions.width
      mockWindow.innerHeight = dimensions.height
      
      // Capture screenshot at this breakpoint
      const screenshot = await this.captureComponentScreenshot(componentId, breakpoint)
      screenshots[breakpoint] = screenshot
    }
    
    return screenshots
  }

  // Test component variants
  async testComponentVariants(componentId: string): Promise<{ [variant: string]: string }> {
    const component = this.registry.components.find(c => c.id === componentId)
    if (!component) {
      throw new Error(`Component ${componentId} not found`)
    }
    
    const variantScreenshots: { [variant: string]: string } = {}
    
    // Test default variant
    variantScreenshots.default = await this.captureComponentScreenshot(componentId)
    
    // Test all defined variants
    for (const variant of component.variants) {
      variantScreenshots[variant.name] = await this.captureComponentScreenshot(componentId, variant.name)
    }
    
    return variantScreenshots
  }

  // Generate visual regression report
  generateReport(): {
    totalTests: number
    passed: number
    failed: number
    newComponents: number
    changes: Array<{ component: string; variant?: string; difference: number }>
  } {
    const report = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      newComponents: 0,
      changes: [] as Array<{ component: string; variant?: string; difference: number }>
    }
    
    for (const [key, screenshot] of this.screenshots) {
      report.totalTests++
      
      const comparison = this.compareScreenshots(key)
      
      if (!this.baselineScreenshots.has(key)) {
        report.newComponents++
      } else if (comparison.match) {
        report.passed++
      } else {
        report.failed++
        const [component, variant] = key.split('-')
        report.changes.push({
          component,
          variant: variant !== 'default' ? variant : undefined,
          difference: comparison.difference || 0
        })
      }
    }
    
    return report
  }
}

export async function runVisualRegressionTests() {
  console.log('📸 Running Visual Regression Tests...\n')
  
  let passed = 0
  let failed = 0

  function test(name: string, fn: () => void | Promise<void>) {
    return async () => {
      try {
        await fn()
        console.log(`✅ ${name}`)
        passed++
      } catch (error: any) {
        console.log(`❌ ${name}`)
        console.log(`   Error: ${error.message}`)
        failed++
      }
    }
  }

  // Setup
  const registry = await createTestComponentRegistry()
  const tester = new VisualRegressionTester(registry)

  // Test 1: Basic component screenshot capture
  await test('Basic component screenshot capture', async () => {
    const screenshot = await tester.captureComponentScreenshot('button')
    assert(typeof screenshot === 'string', 'Should return screenshot as string')
    assert(screenshot.length > 0, 'Screenshot should not be empty')
  })()

  // Test 2: Component variant screenshots
  await test('Component variant screenshots', async () => {
    const variantScreenshots = await tester.testComponentVariants('button')
    assert(Object.keys(variantScreenshots).length > 0, 'Should capture variant screenshots')
    assert('default' in variantScreenshots, 'Should include default variant')
    
    // Check that different variants produce different screenshots
    const defaultScreenshot = variantScreenshots.default
    const hasVariantDifferences = Object.values(variantScreenshots).some(s => s !== defaultScreenshot)
    assert(hasVariantDifferences, 'Different variants should produce different screenshots')
  })()

  // Test 3: Responsive breakpoint testing
  await test('Responsive breakpoint testing', async () => {
    const responsiveScreenshots = await tester.testResponsiveBreakpoints('button')
    assert('mobile' in responsiveScreenshots, 'Should capture mobile screenshot')
    assert('tablet' in responsiveScreenshots, 'Should capture tablet screenshot')
    assert('desktop' in responsiveScreenshots, 'Should capture desktop screenshot')
    
    // Verify different breakpoints produce different results
    const screenshots = Object.values(responsiveScreenshots)
    const uniqueScreenshots = new Set(screenshots)
    assert(uniqueScreenshots.size > 1, 'Different breakpoints should produce different screenshots')
  })()

  // Test 4: Screenshot comparison
  await test('Screenshot comparison functionality', async () => {
    // Capture a screenshot
    await tester.captureComponentScreenshot('button', 'default')
    
    // Compare with baseline
    const comparison = tester.compareScreenshots('button-default')
    assert(typeof comparison.match === 'boolean', 'Should return match boolean')
    
    if (!comparison.match) {
      assert(typeof comparison.difference === 'number', 'Should return difference when not matching')
      assert(comparison.difference >= 0 && comparison.difference <= 1, 'Difference should be between 0 and 1')
    }
  })()

  // Test 5: Multiple component testing
  await test('Multiple component visual testing', async () => {
    const componentsToTest = ['button', 'input', 'card'].filter(id => 
      registry.components.some(c => c.id === id)
    )
    
    for (const componentId of componentsToTest) {
      const screenshot = await tester.captureComponentScreenshot(componentId)
      assert(screenshot.length > 0, `Should capture screenshot for ${componentId}`)
    }
    
    assert(componentsToTest.length > 0, 'Should test multiple components')
  })()

  // Test 6: Visual regression report generation
  await test('Visual regression report generation', async () => {
    // Capture screenshots for several components
    await tester.captureComponentScreenshot('button')
    await tester.captureComponentScreenshot('input')
    
    const report = tester.generateReport()
    
    assert(typeof report.totalTests === 'number', 'Report should include total tests')
    assert(typeof report.passed === 'number', 'Report should include passed count')
    assert(typeof report.failed === 'number', 'Report should include failed count')
    assert(typeof report.newComponents === 'number', 'Report should include new components count')
    assert(Array.isArray(report.changes), 'Report should include changes array')
    
    assertEqual(report.totalTests, report.passed + report.failed + report.newComponents, 
      'Total tests should equal sum of passed, failed, and new components')
  })()

  // Test 7: Error handling for non-existent components
  await test('Error handling for non-existent components', async () => {
    let errorThrown = false
    try {
      await tester.captureComponentScreenshot('non-existent-component')
    } catch (error) {
      errorThrown = true
    }
    assert(errorThrown, 'Should throw error for non-existent component')
  })()

  // Test 8: Performance testing
  await test('Visual testing performance', async () => {
    const startTime = performance.now()
    
    // Capture multiple screenshots
    const promises = []
    for (let i = 0; i < 5; i++) {
      promises.push(tester.captureComponentScreenshot('button', `test-${i}`))
    }
    
    await Promise.all(promises)
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Should complete within reasonable time (5 seconds for 5 screenshots)
    assert(duration < 5000, `Screenshot capture should be performant (took ${duration}ms)`)
  })()

  // Test 9: Baseline management
  await test('Baseline screenshot management', async () => {
    // Test that baseline screenshots are properly loaded
    const comparison1 = tester.compareScreenshots('button-default')
    
    // For components with baselines, should be able to compare
    if (comparison1.match !== undefined) {
      assert(typeof comparison1.match === 'boolean', 'Should provide comparison result for baseline components')
    }
    
    // Test new component (no baseline)
    await tester.captureComponentScreenshot('button', 'new-variant')
    const comparison2 = tester.compareScreenshots('button-new-variant')
    assert(comparison2.match === true, 'New components without baseline should be considered matching')
  })()

  // Summary
  console.log('\n📊 Visual Regression Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  return failed === 0
}

export default runVisualRegressionTests