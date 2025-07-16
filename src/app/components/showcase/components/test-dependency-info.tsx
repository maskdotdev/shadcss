'use client'

import React, { useEffect, useState } from 'react'
import DependencyInfo from './DependencyInfo'
import { createComponentRegistry } from '../lib/component-registry'
import { ComponentRegistry } from '../lib/types'

// Test component to verify DependencyInfo works
const TestDependencyInfo: React.FC = () => {
  const [componentRegistry, setComponentRegistry] = useState<ComponentRegistry | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const registry = await createComponentRegistry()
        setComponentRegistry(registry)
      } catch (error) {
        console.error('Failed to load component registry:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadRegistry()
  }, [])

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">DependencyInfo Test</h2>
        <p>Loading components...</p>
      </div>
    )
  }

  if (!componentRegistry) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">DependencyInfo Test</h2>
        <p>Failed to load component registry.</p>
      </div>
    )
  }

  // Get a component with dependencies for testing
  const buttonComponent = componentRegistry.components.find(c => c.id === 'button')
  const dialogComponent = componentRegistry.components.find(c => c.id === 'dialog')
  const commandComponent = componentRegistry.components.find(c => c.id === 'command')

  if (!buttonComponent && !dialogComponent && !commandComponent) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">DependencyInfo Test</h2>
        <p>No components found in registry for testing.</p>
        <p>Available components: {componentRegistry.components.map(c => c.id).join(', ')}</p>
      </div>
    )
  }

  const testComponent = buttonComponent || dialogComponent || commandComponent

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-4">DependencyInfo Component Test</h2>
      <p className="text-gray-600 mb-6">
        Testing with component: <strong>{testComponent?.name}</strong> ({testComponent?.id})
      </p>
      
      {testComponent && (
        <DependencyInfo component={testComponent} />
      )}
    </div>
  )
}

export default TestDependencyInfo