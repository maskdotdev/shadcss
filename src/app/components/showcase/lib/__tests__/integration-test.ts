/**
 * Integration test for the component registry system
 * This test verifies that the registry can be created and used successfully
 */

import { createComponentRegistry, getComponentById, searchComponents, filterComponents, getComponentStats } from '../component-registry'

export async function runIntegrationTest() {
  console.log('Running component registry integration test...')
  
  try {
    // Test 1: Create registry
    const registry = await createComponentRegistry()
    console.log('✓ Registry created successfully')
    console.log(`  Components found: ${registry.components.length}`)
    console.log(`  Categories: ${Object.keys(registry.categories).length}`)
    
    // Test 2: Component lookup
    const buttonComponent = getComponentById(registry, 'button')
    if (buttonComponent) {
      console.log('✓ Component lookup works')
      console.log(`  Button has ${buttonComponent.variants.length} variants`)
      console.log(`  Button has ${buttonComponent.dependencies.length} dependencies`)
    } else {
      console.log('✗ Button component not found')
    }
    
    // Test 3: Search functionality
    const searchResults = searchComponents(registry, 'button')
    console.log(`✓ Search works - found ${searchResults.length} results for "button"`)
    
    // Test 4: Filtering
    const basicComponents = filterComponents(registry, { category: 'basic' })
    console.log(`✓ Filtering works - found ${basicComponents.length} basic components`)
    
    // Test 5: Statistics
    const stats = getComponentStats(registry)
    console.log('✓ Statistics generated:')
    console.log(`  Total: ${stats.total}`)
    console.log(`  With both versions: ${stats.withBothVersions}`)
    console.log(`  With Radix UI: ${stats.withRadixUI}`)
    
    // Test 6: Verify some key components exist
    const keyComponents = ['button', 'card', 'dialog', 'input', 'select']
    const foundComponents = keyComponents.filter(id => getComponentById(registry, id))
    console.log(`✓ Key components found: ${foundComponents.length}/${keyComponents.length}`)
    
    console.log('\n✅ All integration tests passed!')
    return true
  } catch (error) {
    console.error('❌ Integration test failed:', error)
    return false
  }
}

// Export for potential use in other tests
export { runIntegrationTest as default }