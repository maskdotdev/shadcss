import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  CodeGenerator,
  type CodeGenerationOptions,
  type GeneratedCode 
} from '../code-generator'
import { createComponentRegistry, type ComponentRegistry, type ComponentInfo } from '../component-registry'

describe('Code Generation System', () => {
  let registry: ComponentRegistry
  let codeGenerator: CodeGenerator
  let sampleComponent: ComponentInfo

  beforeEach(() => {
    registry = createComponentRegistry()
    codeGenerator = new CodeGenerator(registry)
    sampleComponent = registry.components.find(c => c.id === 'button') || registry.components[0]
  })

  describe('Code Generator Initialization', () => {
    it('should initialize with component registry', () => {
      expect(codeGenerator).toBeDefined()
      expect(codeGenerator.getAvailableComponents().length).toBe(registry.components.length)
    })
  })

  describe('Basic Code Generation', () => {
    it('should generate basic component usage code', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      expect(code).toBeTruthy()
      expect(typeof code).toBe('string')
      expect(code).toContain('import')
      expect(code).toContain(sampleComponent.name)
    })

    it('should generate code with imports', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id, { includeImports: true })
      expect(code).toContain('import')
      expect(code).toContain('from')
    })

    it('should generate code without imports when specified', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id, { includeImports: false })
      expect(code).not.toContain('import')
    })

    it('should handle non-existent components gracefully', () => {
      const code = codeGenerator.generateUsageCode('non-existent-component')
      expect(code).toBe('')
    })
  })

  describe('Variant Code Generation', () => {
    it('should generate code for specific variants', () => {
      if (sampleComponent.variants.length > 0) {
        const variant = sampleComponent.variants[0]
        const code = codeGenerator.generateVariantCode(sampleComponent.id, variant.name)
        
        expect(code).toBeTruthy()
        expect(code).toContain(sampleComponent.name)
      }
    })

    it('should generate code for all variants', () => {
      const code = codeGenerator.generateAllVariantsCode(sampleComponent.id)
      expect(code).toBeTruthy()
      
      if (sampleComponent.variants.length > 0) {
        sampleComponent.variants.forEach(variant => {
          expect(code).toContain(variant.name)
        })
      }
    })

    it('should handle components without variants', () => {
      const componentWithoutVariants = registry.components.find(c => c.variants.length === 0)
      if (componentWithoutVariants) {
        const code = codeGenerator.generateAllVariantsCode(componentWithoutVariants.id)
        expect(code).toBeTruthy()
      }
    })
  })

  describe('Version-Specific Code Generation', () => {
    it('should generate original version code', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id, { version: 'original' })
      expect(code).toBeTruthy()
      
      if (sampleComponent.hasOriginalVersion) {
        expect(code).toContain('@/components/ui/')
      }
    })

    it('should generate CSS modules version code', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id, { version: 'css-modules' })
      expect(code).toBeTruthy()
      
      if (sampleComponent.hasCssModulesVersion) {
        expect(code).toContain('@/components/shadcss-ui/')
      }
    })

    it('should fallback to available version', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id, { version: 'css-modules' })
      expect(code).toBeTruthy()
      // Should generate some code even if preferred version isn't available
    })
  })

  describe('Installation Code Generation', () => {
    it('should generate installation commands', () => {
      const installCode = codeGenerator.generateInstallationCode(sampleComponent.id)
      expect(installCode).toBeTruthy()
      expect(installCode).toContain('npm install')
    })

    it('should include all dependencies', () => {
      const installCode = codeGenerator.generateInstallationCode(sampleComponent.id)
      sampleComponent.dependencies.forEach(dep => {
        expect(installCode).toContain(dep.name)
      })
    })

    it('should support different package managers', () => {
      const npmCode = codeGenerator.generateInstallationCode(sampleComponent.id, 'npm')
      const yarnCode = codeGenerator.generateInstallationCode(sampleComponent.id, 'yarn')
      const pnpmCode = codeGenerator.generateInstallationCode(sampleComponent.id, 'pnpm')
      
      expect(npmCode).toContain('npm install')
      expect(yarnCode).toContain('yarn add')
      expect(pnpmCode).toContain('pnpm add')
    })
  })

  describe('Complete Example Generation', () => {
    it('should generate complete working examples', () => {
      const example = codeGenerator.generateCompleteExample(sampleComponent.id)
      expect(example).toBeTruthy()
      expect(example).toContain('import')
      expect(example).toContain('export')
      expect(example).toContain('function')
      expect(example).toContain('return')
    })

    it('should generate TypeScript examples', () => {
      const example = codeGenerator.generateCompleteExample(sampleComponent.id, { typescript: true })
      expect(example).toContain('export function')
      expect(example).toContain(': React.')
    })

    it('should generate JavaScript examples', () => {
      const example = codeGenerator.generateCompleteExample(sampleComponent.id, { typescript: false })
      expect(example).not.toContain(': React.')
    })
  })

  describe('Code Formatting', () => {
    it('should generate properly formatted code', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      
      // Check for proper indentation
      const lines = code.split('\n')
      const indentedLines = lines.filter(line => line.startsWith('  '))
      expect(indentedLines.length).toBeGreaterThan(0)
    })

    it('should handle code formatting options', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id, { 
        indentSize: 4,
        useTabs: false 
      })
      expect(code).toBeTruthy()
    })

    it('should generate valid syntax', () => {
      const code = codeGenerator.generateCompleteExample(sampleComponent.id)
      
      // Basic syntax checks
      expect(code).not.toContain('<<')
      expect(code).not.toContain('>>')
      expect(code.split('{').length).toBe(code.split('}').length)
    })
  })

  describe('Code Copying Functionality', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
        configurable: true,
      })
    })

    it('should copy code to clipboard', async () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      await codeGenerator.copyToClipboard(code)
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code)
    })

    it('should handle clipboard errors gracefully', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'))
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        configurable: true,
      })

      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      await expect(codeGenerator.copyToClipboard(code)).resolves.not.toThrow()
    })

    it('should provide fallback for unsupported browsers', async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      })

      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      const result = await codeGenerator.copyToClipboard(code)
      
      // Should handle gracefully without throwing
      expect(result).toBeDefined()
    })
  })

  describe('Code Templates', () => {
    it('should use component-specific templates', () => {
      const buttonCode = codeGenerator.generateUsageCode('button')
      const cardCode = codeGenerator.generateUsageCode('card')
      
      // Different components should generate different code
      expect(buttonCode).not.toBe(cardCode)
    })

    it('should support custom templates', () => {
      const customTemplate = 'Custom template for {{componentName}}'
      const code = codeGenerator.generateFromTemplate(sampleComponent.id, customTemplate)
      
      expect(code).toContain(sampleComponent.name)
      expect(code).toContain('Custom template')
    })

    it('should handle template variables', () => {
      const template = 'import { {{componentName}} } from "{{importPath}}"'
      const code = codeGenerator.generateFromTemplate(sampleComponent.id, template)
      
      expect(code).toContain(`import { ${sampleComponent.name} }`)
      expect(code).toContain('from')
    })
  })

  describe('Code Validation', () => {
    it('should validate generated code syntax', () => {
      const code = codeGenerator.generateCompleteExample(sampleComponent.id)
      const isValid = codeGenerator.validateSyntax(code)
      
      expect(isValid).toBe(true)
    })

    it('should detect syntax errors', () => {
      const invalidCode = 'import { Button from "@/components/ui/button"' // Missing closing brace
      const isValid = codeGenerator.validateSyntax(invalidCode)
      
      expect(isValid).toBe(false)
    })

    it('should validate imports', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      const hasValidImports = codeGenerator.validateImports(code)
      
      expect(hasValidImports).toBe(true)
    })
  })

  describe('Code Generation Performance', () => {
    it('should generate code efficiently', () => {
      const start = performance.now()
      codeGenerator.generateUsageCode(sampleComponent.id)
      const end = performance.now()
      
      // Should complete within 50ms
      expect(end - start).toBeLessThan(50)
    })

    it('should handle batch generation efficiently', () => {
      const componentIds = registry.components.slice(0, 10).map(c => c.id)
      
      const start = performance.now()
      componentIds.forEach(id => codeGenerator.generateUsageCode(id))
      const end = performance.now()
      
      // Should complete within 200ms for 10 components
      expect(end - start).toBeLessThan(200)
    })
  })

  describe('Code Generation Options', () => {
    it('should respect generation options', () => {
      const options: CodeGenerationOptions = {
        includeImports: true,
        includeTypes: true,
        version: 'css-modules',
        typescript: true,
        indentSize: 4
      }
      
      const code = codeGenerator.generateUsageCode(sampleComponent.id, options)
      expect(code).toBeTruthy()
    })

    it('should handle partial options', () => {
      const options: Partial<CodeGenerationOptions> = {
        includeImports: false
      }
      
      const code = codeGenerator.generateUsageCode(sampleComponent.id, options)
      expect(code).not.toContain('import')
    })

    it('should use default options when none provided', () => {
      const code = codeGenerator.generateUsageCode(sampleComponent.id)
      expect(code).toBeTruthy()
    })
  })
})