import { ComponentInfo, ComponentDependency, ComponentVariant, ComponentFileInfo, DependencyAnalysis } from './types'

/**
 * Discovers all components by calling the server-side API
 */
export async function discoverComponents(): Promise<ComponentInfo[]> {
  try {
    const response = await fetch('/api/components/discovery')
    if (!response.ok) {
      throw new Error(`Failed to fetch components: ${response.statusText}`)
    }
    const data = await response.json()
    return data.components || []
  } catch (error) {
    console.error('Error discovering components:', error)
    return []
  }
}

/**
 * Refreshes component discovery by re-scanning directories
 */
export async function refreshComponentDiscovery(): Promise<ComponentInfo[]> {
  return await discoverComponents()
}