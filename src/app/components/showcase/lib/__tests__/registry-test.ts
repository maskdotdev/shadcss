// Test file to verify the component registry functionality
import { createComponentRegistry, getComponentById, searchComponents, filterComponents, getComponentStats } from '../component-registry'

export function testComponentRegistry() {
  console.log('Testing component registry...')
  
  try {
    // Create the registry
    const registry = createComponentRegistry()
    
    console.log('✓ Registry created successfully')
    console.log(`  - Total components: ${registry.components.length}`)
    console.log(`  - Categories: ${Object.keys(registry.categories).join(', ')}`)
    console.log(`  - Dependencies mapped: ${Object.keys(registry.dependencyMap).length}`)
    
    // Test component lookup
    const buttonComponent = getComponentById(registry, 'button')
    if (buttonComponent) {
      console.log('✓ Component lookup works')
      console.log(`  - Button component found: ${buttonComponent.name}`)
      console.log(`  - Has original version: ${buttonComponent.hasOriginalVersion}`)
      console.log(`  - Has CSS modules version: ${buttonComponent.hasCssModulesVersion}`)
      console.log(`  - Dependencies: ${buttonComponent.dependencies.length}`)
      console.log(`  - Variants: ${buttonComponent.variants.length}`)
    } else {
      console.log('✗ Button component not found')
    }
    
    // Test search
    const searchResults = searchComponents(registry, 'button')
    console.log(`✓ Search works - found ${searchResults.length} results for "button"`)
    
    // Test filtering
    const basicComponents = filterComponents(registry, { category: 'basic' })
    console.log(`✓ Filtering works - found ${basicComponents.length} basic components`)
    
    // Test stats
    const stats = getComponentStats(registry)
    console.log('✓ Stats generated:')
    console.log(`  - Total: ${stats.total}`)
    console.log(`  - With original version: ${stats.withOriginalVersion}`)
    console.log(`  - With CSS modules version: ${stats.withCssModulesVersion}`)
    console.log(`  - With both versions: ${stats.withBothVersions}`)
    console.log(`  - With Radix UI: ${stats.withRadixUI}`)
    console.log(`  - With external libraries: ${stats.withExternalLibraries}`)
    
    // Sample some components
    console.log('\nSample components:')
    registry.components.slice(0, 5).forEach(component => {
      console.log(`  - ${component.name} (${component.category})`)
      console.log(`    Original: ${component.hasOriginalVersion}, CSS Modules: ${component.hasCssModulesVersion}`)
      console.log(`    Dependencies: ${component.dependencies.map(d => d.name).join(', ')}`)
      if (component.variants.length > 0) {
        console.log(`    Variants: ${component.variants.map(v => v.name).join(', ')}`)
      }
    })
    
    return true
  } catch (error) {
    console.error('✗ Registry test failed:', error)
    return false
  }
}