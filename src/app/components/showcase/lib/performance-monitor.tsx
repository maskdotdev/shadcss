/**
 * Performance monitoring utilities for the component showcase
 * Tracks loading times, bundle sizes, and user interactions
 */

import React from 'react'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  metadata?: Record<string, unknown>
}

interface BundleAnalysis {
  totalSize: number
  chunks: Array<{
    name: string
    size: number
    type: 'initial' | 'async' | 'runtime'
  }>
  dependencies: Array<{
    name: string
    size: number
    version?: string
  }>
}

interface UserInteractionMetric {
  action: string
  component?: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private interactions: UserInteractionMetric[] = []
  private observers: Map<string, PerformanceObserver> = new Map()
  private startTimes: Map<string, number> = new Map()

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart)
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart)
              this.recordMetric('first_paint', navEntry.loadEventEnd - navEntry.fetchStart)
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.set('navigation', navObserver)
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error)
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming
              if (resourceEntry.name.includes('showcase') || resourceEntry.name.includes('component')) {
                this.recordMetric('resource_load_time', resourceEntry.responseEnd - resourceEntry.startTime, {
                  resource: resourceEntry.name,
                  size: resourceEntry.transferSize,
                  type: this.getResourceType(resourceEntry.name)
                })
              }
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.set('resource', resourceObserver)
      } catch (error) {
        console.warn('Resource timing observer not supported:', error)
      }

      // Measure observer for custom metrics
      try {
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordMetric(entry.name, entry.duration, {
                startTime: entry.startTime
              })
            }
          }
        })
        measureObserver.observe({ entryTypes: ['measure'] })
        this.observers.set('measure', measureObserver)
      } catch (error) {
        console.warn('Measure observer not supported:', error)
      }
    }

    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        this.recordMetric('memory_used', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        })
      }, 30000) // Every 30 seconds
    }
  }

  private getResourceType(url: string): string {
    if (url.endsWith('.js')) return 'javascript'
    if (url.endsWith('.css')) return 'stylesheet'
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image'
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font'
    return 'other'
  }

  // Record a performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata
    })

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // Start timing an operation
  startTiming(name: string) {
    this.startTimes.set(name, performance.now())
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}_start`)
    }
  }

  // End timing an operation
  endTiming(name: string, metadata?: Record<string, unknown>) {
    const startTime = this.startTimes.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.recordMetric(name, duration, metadata)
      this.startTimes.delete(name)

      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.mark(`${name}_end`)
        performance.measure(name, `${name}_start`, `${name}_end`)
      }
    }
  }

  // Record user interaction
  recordInteraction(action: string, component?: string, metadata?: Record<string, unknown>) {
    const startTime = performance.now()
    
    // Use requestIdleCallback to measure when the interaction is complete
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        const duration = performance.now() - startTime
        this.interactions.push({
          action,
          component,
          duration,
          timestamp: Date.now(),
          metadata
        })

        // Keep only last 500 interactions
        if (this.interactions.length > 500) {
          this.interactions = this.interactions.slice(-500)
        }
      })
    }
  }

  // Measure component render time
  measureComponentRender<T>(componentName: string, renderFn: () => T): T {
    this.startTiming(`component_render_${componentName}`)
    try {
      const result = renderFn()
      this.endTiming(`component_render_${componentName}`, { component: componentName })
      return result
    } catch (error) {
      this.endTiming(`component_render_${componentName}`, { 
        component: componentName, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      throw error
    }
  }

  // Measure async operation
  async measureAsync<T>(name: string, asyncFn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
    this.startTiming(name)
    try {
      const result = await asyncFn()
      this.endTiming(name, metadata)
      return result
    } catch (error) {
      this.endTiming(name, { 
        ...metadata, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      throw error
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 300000) // Last 5 minutes

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      averages: {} as Record<string, number>,
      peaks: {} as Record<string, number>,
      interactions: {
        total: this.interactions.length,
        recent: this.interactions.filter(i => now - i.timestamp < 60000).length, // Last minute
        averageDuration: 0
      },
      memory: this.getMemoryUsage(),
      recommendations: [] as string[]
    }

    // Calculate averages and peaks
    const metricGroups = new Map<string, number[]>()
    recentMetrics.forEach(metric => {
      if (!metricGroups.has(metric.name)) {
        metricGroups.set(metric.name, [])
      }
      metricGroups.get(metric.name)!.push(metric.value)
    })

    metricGroups.forEach((values, name) => {
      summary.averages[name] = values.reduce((a, b) => a + b, 0) / values.length
      summary.peaks[name] = Math.max(...values)
    })

    // Calculate interaction averages
    if (this.interactions.length > 0) {
      summary.interactions.averageDuration = 
        this.interactions.reduce((sum, i) => sum + i.duration, 0) / this.interactions.length
    }

    // Generate recommendations
    if (summary.averages.component_render_button > 100) {
      summary.recommendations.push('Button component rendering is slow (>100ms)')
    }
    if (summary.averages.resource_load_time > 2000) {
      summary.recommendations.push('Resource loading is slow (>2s)')
    }
    if (summary.interactions.averageDuration > 500) {
      summary.recommendations.push('User interactions are slow (>500ms)')
    }
    if (summary.memory && summary.memory.used > summary.memory.limit * 0.8) {
      summary.recommendations.push('Memory usage is high (>80% of limit)')
    }

    return summary
  }

  // Get memory usage information
  private getMemoryUsage() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      }
    }
    return null
  }

  // Analyze bundle size (mock implementation - would integrate with webpack-bundle-analyzer in real app)
  analyzeBundleSize(): BundleAnalysis {
    // This would typically integrate with webpack-bundle-analyzer or similar tool
    // For now, we'll return mock data based on typical showcase bundle analysis
    return {
      totalSize: 2500000, // 2.5MB
      chunks: [
        { name: 'main', size: 800000, type: 'initial' },
        { name: 'showcase', size: 600000, type: 'async' },
        { name: 'components', size: 400000, type: 'async' },
        { name: 'syntax-highlighter', size: 300000, type: 'async' },
        { name: 'runtime', size: 50000, type: 'runtime' }
      ],
      dependencies: [
        { name: 'react', size: 150000, version: '18.0.0' },
        { name: 'react-dom', size: 200000, version: '18.0.0' },
        { name: 'next', size: 400000, version: '14.0.0' },
        { name: 'shiki', size: 200000, version: '3.8.0' },
        { name: '@radix-ui/react-*', size: 250000, version: '1.0.0' }
      ]
    }
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      interactions: this.interactions,
      summary: this.getPerformanceSummary(),
      bundleAnalysis: this.analyzeBundleSize(),
      timestamp: Date.now()
    }
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = []
    this.interactions = []
    this.startTimes.clear()
  }

  // Cleanup observers
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.clearMetrics()
  }
}

// Performance cache for memoization
export class PerformanceCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number }>()
  
  constructor(
    private maxSize: number = 100,
    private ttl: number = 5 * 60 * 1000 // 5 minutes default
  ) {}

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Singleton instance
let performanceMonitorInstance: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor()
  }
  return performanceMonitorInstance
}

// Export singleton instance for backward compatibility
export const performanceMonitor = {
  measure<T>(name: string, fn: () => T): T {
    return getPerformanceMonitor().measureComponentRender(name, fn)
  },
  
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return getPerformanceMonitor().measureAsync(name, fn)
  },
  
  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    getPerformanceMonitor().recordMetric(name, value, metadata)
  },
  
  startTiming(name: string) {
    getPerformanceMonitor().startTiming(name)
  },
  
  endTiming(name: string, metadata?: Record<string, unknown>) {
    getPerformanceMonitor().endTiming(name, metadata)
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = getPerformanceMonitor()

  const measureRender = React.useCallback(<T,>(componentName: string, renderFn: () => T): T => {
    return monitor.measureComponentRender(componentName, renderFn)
  }, [monitor])

  const recordInteraction = React.useCallback((action: string, component?: string, metadata?: Record<string, unknown>) => {
    monitor.recordInteraction(action, component, metadata)
  }, [monitor])

  const startTiming = React.useCallback((name: string) => {
    monitor.startTiming(name)
  }, [monitor])

  const endTiming = React.useCallback((name: string, metadata?: Record<string, unknown>) => {
    monitor.endTiming(name, metadata)
  }, [monitor])

  return {
    measureRender,
    recordInteraction,
    startTiming,
    endTiming,
    getMetrics: () => monitor.exportMetrics(),
    getSummary: () => monitor.getPerformanceSummary()
  }
}

// Performance monitoring decorator for components
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const MonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const monitor = getPerformanceMonitor()
    
    React.useEffect(() => {
      monitor.recordInteraction('component_mount', componentName)
      return () => {
        monitor.recordInteraction('component_unmount', componentName)
      }
    }, [monitor])

    return monitor.measureComponentRender(componentName, () => (
      <WrappedComponent {...props} ref={ref} />
    ))
  })

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`
  return MonitoredComponent
}

export default PerformanceMonitor