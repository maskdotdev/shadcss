/**
 * Bundle size optimization utilities
 * Provides tools for analyzing and optimizing JavaScript bundle sizes
 */

interface BundleChunk {
  name: string
  size: number
  gzipSize?: number
  modules: string[]
  type: 'initial' | 'async' | 'runtime'
}

interface DependencyAnalysis {
  name: string
  size: number
  version: string
  treeshakeable: boolean
  sideEffects: boolean
  alternatives?: string[]
}

interface BundleAnalysis {
  totalSize: number
  totalGzipSize: number
  chunks: BundleChunk[]
  dependencies: DependencyAnalysis[]
  duplicates: Array<{
    module: string
    chunks: string[]
    totalSize: number
  }>
  recommendations: string[]
}

/**
 * Bundle analyzer for the component showcase
 */
export class BundleAnalyzer {
  private analysis: BundleAnalysis | null = null

  /**
   * Analyzes the current bundle (mock implementation)
   * In a real application, this would integrate with webpack-bundle-analyzer
   */
  async analyzeBundles(): Promise<BundleAnalysis> {
    // Mock analysis - in production, this would use actual webpack stats
    const analysis: BundleAnalysis = {
      totalSize: 2800000, // 2.8MB
      totalGzipSize: 850000, // 850KB
      chunks: [
        {
          name: 'main',
          size: 900000,
          gzipSize: 280000,
          modules: ['react', 'react-dom', 'next', 'app-core'],
          type: 'initial'
        },
        {
          name: 'showcase',
          size: 650000,
          gzipSize: 200000,
          modules: ['showcase-components', 'component-registry', 'search-engine'],
          type: 'async'
        },
        {
          name: 'syntax-highlighter',
          size: 450000,
          gzipSize: 140000,
          modules: ['shiki'],
          type: 'async'
        },
        {
          name: 'components',
          size: 350000,
          gzipSize: 110000,
          modules: ['shadcss-ui-components', 'radix-ui-components'],
          type: 'async'
        },
        {
          name: 'vendor',
          size: 400000,
          gzipSize: 120000,
          modules: ['lodash', 'date-fns', 'lucide-react'],
          type: 'async'
        },
        {
          name: 'runtime',
          size: 50000,
          gzipSize: 15000,
          modules: ['webpack-runtime'],
          type: 'runtime'
        }
      ],
      dependencies: [
        {
          name: 'shiki',
          size: 200000,
          version: '3.8.0',
          treeshakeable: true,
          sideEffects: false,
          alternatives: ['prism-react-renderer', 'highlight.js']
        },
        {
          name: 'lodash',
          size: 200000,
          version: '4.17.21',
          treeshakeable: true,
          sideEffects: false,
          alternatives: ['lodash-es', 'ramda', 'native-methods']
        },
        {
          name: '@radix-ui/react-*',
          size: 300000,
          version: '1.0.0',
          treeshakeable: true,
          sideEffects: false
        },
        {
          name: 'lucide-react',
          size: 150000,
          version: '0.263.1',
          treeshakeable: true,
          sideEffects: false
        },
        {
          name: 'date-fns',
          size: 100000,
          version: '2.30.0',
          treeshakeable: true,
          sideEffects: false
        }
      ],
      duplicates: [
        {
          module: 'react',
          chunks: ['main', 'showcase'],
          totalSize: 50000
        },
        {
          module: 'tslib',
          chunks: ['main', 'components', 'vendor'],
          totalSize: 30000
        }
      ],
      recommendations: []
    }

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis)
    this.analysis = analysis

    return analysis
  }

  /**
   * Generates optimization recommendations
   */
  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = []

    // Check for large dependencies
    const largeDeps = analysis.dependencies.filter(dep => dep.size > 200000)
    if (largeDeps.length > 0) {
      recommendations.push(
        `Consider optimizing large dependencies: ${largeDeps.map(d => d.name).join(', ')}`
      )
    }

    // Check for non-treeshakeable dependencies
    const nonTreeshakeable = analysis.dependencies.filter(dep => !dep.treeshakeable)
    if (nonTreeshakeable.length > 0) {
      recommendations.push(
        `Replace non-treeshakeable dependencies: ${nonTreeshakeable.map(d => d.name).join(', ')}`
      )
    }

    // Check for duplicates
    if (analysis.duplicates.length > 0) {
      const duplicateSize = analysis.duplicates.reduce((sum, dup) => sum + dup.totalSize, 0)
      recommendations.push(
        `Remove duplicate modules to save ${this.formatSize(duplicateSize)}`
      )
    }

    // Check total bundle size
    if (analysis.totalSize > 3000000) { // 3MB
      recommendations.push('Total bundle size is large (>3MB), consider code splitting')
    }

    // Check gzip ratio
    const gzipRatio = analysis.totalGzipSize / analysis.totalSize
    if (gzipRatio > 0.4) {
      recommendations.push('Poor gzip compression ratio, check for repetitive code')
    }

    // Check for async chunk sizes
    const largeAsyncChunks = analysis.chunks.filter(
      chunk => chunk.type === 'async' && chunk.size > 500000
    )
    if (largeAsyncChunks.length > 0) {
      recommendations.push(
        `Split large async chunks: ${largeAsyncChunks.map(c => c.name).join(', ')}`
      )
    }

    return recommendations
  }

  /**
   * Gets optimization suggestions for specific dependencies
   */
  getDependencyOptimizations(): Array<{
    dependency: string
    currentSize: number
    optimizations: Array<{
      type: 'replace' | 'treeshake' | 'lazy-load' | 'cdn'
      description: string
      estimatedSavings: number
    }>
  }> {
    if (!this.analysis) return []

    return [
      {
        dependency: 'shiki',
        currentSize: 200000,
        optimizations: [
          {
            type: 'lazy-load',
            description: 'Load syntax highlighter only when code tab is active',
            estimatedSavings: 200000
          },
          {
            type: 'treeshake',
            description: 'Load only required languages and themes',
            estimatedSavings: 100000
          }
        ]
      },
      {
        dependency: 'lodash',
        currentSize: 200000,
        optimizations: [
          {
            type: 'treeshake',
            description: 'Import only specific functions instead of entire library',
            estimatedSavings: 150000
          },
          {
            type: 'replace',
            description: 'Replace with native JavaScript methods where possible',
            estimatedSavings: 200000
          }
        ]
      },
      {
        dependency: '@radix-ui/react-*',
        currentSize: 300000,
        optimizations: [
          {
            type: 'lazy-load',
            description: 'Load Radix components only when needed',
            estimatedSavings: 150000
          },
          {
            type: 'treeshake',
            description: 'Ensure only used Radix components are bundled',
            estimatedSavings: 100000
          }
        ]
      }
    ]
  }

  /**
   * Formats byte size for display
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)}${units[unitIndex]}`
  }

  /**
   * Gets current analysis
   */
  getAnalysis(): BundleAnalysis | null {
    return this.analysis
  }

  /**
   * Calculates potential savings from optimizations
   */
  calculatePotentialSavings(): {
    totalSavings: number
    optimizations: Array<{
      type: string
      description: string
      savings: number
    }>
  } {
    const optimizations = this.getDependencyOptimizations()
    const allOptimizations: Array<{
      type: string
      description: string
      savings: number
    }> = []

    let totalSavings = 0

    for (const dep of optimizations) {
      for (const opt of dep.optimizations) {
        allOptimizations.push({
          type: opt.type,
          description: `${dep.dependency}: ${opt.description}`,
          savings: opt.estimatedSavings
        })
        totalSavings += opt.estimatedSavings
      }
    }

    return {
      totalSavings,
      optimizations: allOptimizations.sort((a, b) => b.savings - a.savings)
    }
  }
}

/**
 * Tree shaking utilities
 */
export class TreeShakingOptimizer {
  /**
   * Analyzes which exports are actually used
   */
  analyzeUsedExports(modulePath: string): {
    totalExports: number
    usedExports: number
    unusedExports: string[]
    potentialSavings: number
  } {
    // Mock implementation - in real app, this would analyze actual usage
    const mockAnalysis = {
      'lodash': {
        totalExports: 300,
        usedExports: 15,
        unusedExports: ['chunk', 'compact', 'concat', 'difference', 'drop'],
        potentialSavings: 150000
      },
      'lucide-react': {
        totalExports: 1000,
        usedExports: 25,
        unusedExports: ['Activity', 'Airplay', 'AlertCircle', 'AlertTriangle'],
        potentialSavings: 120000
      },
      'date-fns': {
        totalExports: 200,
        usedExports: 8,
        unusedExports: ['addBusinessDays', 'addDays', 'addHours'],
        potentialSavings: 80000
      }
    }

    return mockAnalysis[modulePath as keyof typeof mockAnalysis] || {
      totalExports: 0,
      usedExports: 0,
      unusedExports: [],
      potentialSavings: 0
    }
  }

  /**
   * Generates tree shaking recommendations
   */
  getTreeShakingRecommendations(): Array<{
    module: string
    recommendation: string
    example: string
    savings: number
  }> {
    return [
      {
        module: 'lodash',
        recommendation: 'Import specific functions instead of the entire library',
        example: "import { debounce, throttle } from 'lodash' → import debounce from 'lodash/debounce'",
        savings: 150000
      },
      {
        module: 'lucide-react',
        recommendation: 'Import only the icons you use',
        example: "import * as Icons from 'lucide-react' → import { Search, Menu } from 'lucide-react'",
        savings: 120000
      },
      {
        module: 'date-fns',
        recommendation: 'Import specific date functions',
        example: "import * as dateFns from 'date-fns' → import { format, parseISO } from 'date-fns'",
        savings: 80000
      }
    ]
  }
}

/**
 * Code splitting optimizer
 */
export class CodeSplittingOptimizer {
  /**
   * Analyzes current code splitting strategy
   */
  analyzeCodeSplitting(): {
    currentStrategy: string
    recommendations: Array<{
      type: 'route' | 'component' | 'vendor'
      description: string
      implementation: string
      estimatedSavings: number
    }>
  } {
    return {
      currentStrategy: 'Basic route-based splitting',
      recommendations: [
        {
          type: 'component',
          description: 'Split heavy components like syntax highlighter',
          implementation: "const SyntaxHighlighter = lazy(() => import('./SyntaxHighlighter'))",
          estimatedSavings: 450000
        },
        {
          type: 'vendor',
          description: 'Split vendor libraries into separate chunks',
          implementation: 'Configure webpack splitChunks for vendor libraries',
          estimatedSavings: 200000
        },
        {
          type: 'route',
          description: 'Implement more granular route splitting',
          implementation: 'Split showcase routes by component category',
          estimatedSavings: 300000
        }
      ]
    }
  }

  /**
   * Generates dynamic import suggestions
   */
  getDynamicImportSuggestions(): Array<{
    module: string
    currentImport: string
    optimizedImport: string
    trigger: string
    savings: number
  }> {
    return [
      {
        module: 'shiki',
        currentImport: "import { getHighlighter } from 'shiki'",
        optimizedImport: "const getHighlighter = lazy(() => import('shiki').then(m => ({ default: m.getHighlighter })))",
        trigger: 'When code tab is clicked',
        savings: 200000
      },
      {
        module: 'component-examples',
        currentImport: "import { ButtonExamples } from './examples'",
        optimizedImport: "const ButtonExamples = lazy(() => import('./examples/ButtonExamples'))",
        trigger: 'When component is selected',
        savings: 100000
      },
      {
        module: 'accessibility-panel',
        currentImport: "import { AccessibilityPanel } from './AccessibilityPanel'",
        optimizedImport: "const AccessibilityPanel = lazy(() => import('./AccessibilityPanel'))",
        trigger: 'When accessibility tab is clicked',
        savings: 80000
      }
    ]
  }
}

/**
 * Main bundle optimization manager
 */
export class BundleOptimizationManager {
  private analyzer = new BundleAnalyzer()
  private treeShaker = new TreeShakingOptimizer()
  private codeSplitter = new CodeSplittingOptimizer()

  /**
   * Performs comprehensive bundle analysis
   */
  async performFullAnalysis() {
    const bundleAnalysis = await this.analyzer.analyzeBundles()
    const treeShakingRecommendations = this.treeShaker.getTreeShakingRecommendations()
    const codeSplittingAnalysis = this.codeSplitter.analyzeCodeSplitting()
    const dynamicImportSuggestions = this.codeSplitter.getDynamicImportSuggestions()
    const potentialSavings = this.analyzer.calculatePotentialSavings()

    return {
      bundleAnalysis,
      treeShakingRecommendations,
      codeSplittingAnalysis,
      dynamicImportSuggestions,
      potentialSavings,
      summary: {
        currentSize: bundleAnalysis.totalSize,
        currentGzipSize: bundleAnalysis.totalGzipSize,
        potentialSavings: potentialSavings.totalSavings,
        optimizedSize: bundleAnalysis.totalSize - potentialSavings.totalSavings,
        compressionRatio: bundleAnalysis.totalGzipSize / bundleAnalysis.totalSize
      }
    }
  }

  /**
   * Generates webpack configuration optimizations
   */
  generateWebpackOptimizations() {
    return {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true
          },
          syntaxHighlighter: {
            test: /[\\/]node_modules[\\/](shiki)[\\/]/,
            name: 'syntax-highlighter',
            chunks: 'all',
            priority: 20
          }
        }
      },
      optimization: {
        usedExports: true,
        sideEffects: false,
        moduleIds: 'deterministic',
        runtimeChunk: 'single'
      }
    }
  }
}

// Singleton instance
let optimizationManager: BundleOptimizationManager | null = null

export function getBundleOptimizationManager(): BundleOptimizationManager {
  if (!optimizationManager) {
    optimizationManager = new BundleOptimizationManager()
  }
  return optimizationManager
}

export default BundleOptimizationManager