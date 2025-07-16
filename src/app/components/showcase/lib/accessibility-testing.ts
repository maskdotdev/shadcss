'use client'

// Accessibility testing and validation utilities for the component showcase

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  rule: string
  message: string
  element?: HTMLElement
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
}

export interface AccessibilityTestResult {
  passed: boolean
  issues: AccessibilityIssue[]
  score: number // 0-100
  summary: {
    errors: number
    warnings: number
    info: number
  }
}

export interface ColorContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'A' | 'FAIL'
  passed: boolean
  foreground: string
  background: string
}

// Color contrast validation
export class ColorContrastValidator {
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)
    
    if (!rgb1 || !rgb2) return 0

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  static validateContrast(foreground: string, background: string, fontSize: number = 16): ColorContrastResult {
    const ratio = this.getContrastRatio(foreground, background)
    const isLargeText = fontSize >= 18 || fontSize >= 14 // 14pt bold is considered large
    
    let level: ColorContrastResult['level']
    let passed = false

    if (ratio >= 7) {
      level = 'AAA'
      passed = true
    } else if (ratio >= 4.5 || (isLargeText && ratio >= 3)) {
      level = 'AA'
      passed = true
    } else if (ratio >= 3) {
      level = 'A'
      passed = false
    } else {
      level = 'FAIL'
      passed = false
    }

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      passed,
      foreground,
      background
    }
  }

  static validateElementContrast(element: HTMLElement): ColorContrastResult | null {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    const backgroundColor = styles.backgroundColor
    const fontSize = parseFloat(styles.fontSize)

    // Convert colors to hex if possible
    const colorHex = this.rgbToHex(color)
    const bgColorHex = this.rgbToHex(backgroundColor)

    if (!colorHex || !bgColorHex) return null

    return this.validateContrast(colorHex, bgColorHex, fontSize)
  }

  private static rgbToHex(rgb: string): string | null {
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!match) return null

    const [, r, g, b] = match
    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
  }
}

// Keyboard navigation testing
export class KeyboardNavigationTester {
  static testTabOrder(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const visibleElements = Array.from(focusableElements).filter(
      el => el.offsetParent !== null && !el.hasAttribute('disabled')
    )

    // Check for missing tabindex on interactive elements
    visibleElements.forEach((element, index) => {
      const tagName = element.tagName.toLowerCase()
      const role = element.getAttribute('role')
      
      if ((role === 'button' || role === 'link') && !element.hasAttribute('tabindex')) {
        issues.push({
          type: 'warning',
          rule: 'keyboard-navigation',
          message: `Interactive element with role="${role}" should have explicit tabindex`,
          element,
          severity: 'moderate'
        })
      }

      // Check for skip links
      if (index === 0 && !element.textContent?.toLowerCase().includes('skip')) {
        issues.push({
          type: 'info',
          rule: 'skip-links',
          message: 'Consider adding skip links for better keyboard navigation',
          element,
          severity: 'minor'
        })
      }
    })

    return issues
  }

  static testKeyboardTraps(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []
    
    // Check for potential keyboard traps
    const modals = container.querySelectorAll('[role="dialog"], [role="alertdialog"]')
    modals.forEach(modal => {
      const focusableInModal = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (focusableInModal.length === 0) {
        issues.push({
          type: 'error',
          rule: 'keyboard-trap',
          message: 'Modal dialog must contain at least one focusable element',
          element: modal as HTMLElement,
          severity: 'critical'
        })
      }
    })

    return issues
  }
}

// ARIA and semantic HTML testing
export class ARIATester {
  static testARIALabels(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for missing labels on form controls
    const formControls = container.querySelectorAll('input, select, textarea')
    formControls.forEach(control => {
      const hasLabel = control.hasAttribute('aria-label') || 
                      control.hasAttribute('aria-labelledby') ||
                      container.querySelector(`label[for="${control.id}"]`)

      if (!hasLabel) {
        issues.push({
          type: 'error',
          rule: 'form-labels',
          message: 'Form control must have an accessible label',
          element: control as HTMLElement,
          severity: 'critical'
        })
      }
    })

    // Check for missing alt text on images
    const images = container.querySelectorAll('img')
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          type: 'error',
          rule: 'image-alt',
          message: 'Image must have alt attribute',
          element: img,
          severity: 'serious'
        })
      }
    })

    // Check for proper heading hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let lastLevel = 0
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1))
      if (level > lastLevel + 1) {
        issues.push({
          type: 'warning',
          rule: 'heading-hierarchy',
          message: `Heading level ${level} skips level ${lastLevel + 1}`,
          element: heading as HTMLElement,
          severity: 'moderate'
        })
      }
      lastLevel = level
    })

    // Check for proper button labels
    const buttons = container.querySelectorAll('button')
    buttons.forEach(button => {
      const hasAccessibleName = button.textContent?.trim() ||
                               button.hasAttribute('aria-label') ||
                               button.hasAttribute('aria-labelledby')

      if (!hasAccessibleName) {
        issues.push({
          type: 'error',
          rule: 'button-name',
          message: 'Button must have accessible name',
          element: button,
          severity: 'critical'
        })
      }
    })

    return issues
  }

  static testLiveRegions(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for proper live region usage
    const liveRegions = container.querySelectorAll('[aria-live]')
    liveRegions.forEach(region => {
      const liveValue = region.getAttribute('aria-live')
      if (!['polite', 'assertive', 'off'].includes(liveValue || '')) {
        issues.push({
          type: 'error',
          rule: 'live-region',
          message: 'aria-live must be "polite", "assertive", or "off"',
          element: region as HTMLElement,
          severity: 'serious'
        })
      }
    })

    return issues
  }
}

// Main accessibility testing class
export class AccessibilityTester {
  static async runFullTest(container: HTMLElement): Promise<AccessibilityTestResult> {
    const issues: AccessibilityIssue[] = []

    // Run all tests
    issues.push(...KeyboardNavigationTester.testTabOrder(container))
    issues.push(...KeyboardNavigationTester.testKeyboardTraps(container))
    issues.push(...ARIATester.testARIALabels(container))
    issues.push(...ARIATester.testLiveRegions(container))

    // Test color contrast for all text elements
    const textElements = container.querySelectorAll('*')
    textElements.forEach(element => {
      if (element.textContent?.trim()) {
        const contrastResult = ColorContrastValidator.validateElementContrast(element as HTMLElement)
        if (contrastResult && !contrastResult.passed) {
          issues.push({
            type: contrastResult.level === 'FAIL' ? 'error' : 'warning',
            rule: 'color-contrast',
            message: `Color contrast ratio ${contrastResult.ratio}:1 does not meet ${contrastResult.level === 'FAIL' ? 'minimum' : 'enhanced'} standards`,
            element: element as HTMLElement,
            severity: contrastResult.level === 'FAIL' ? 'critical' : 'moderate'
          })
        }
      }
    })

    // Calculate summary
    const summary = {
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length
    }

    // Calculate score (0-100)
    const totalIssues = summary.errors + summary.warnings + summary.info
    const weightedScore = (summary.errors * 10) + (summary.warnings * 5) + (summary.info * 1)
    const score = Math.max(0, 100 - weightedScore)

    return {
      passed: summary.errors === 0,
      issues,
      score,
      summary
    }
  }

  static async testComponent(componentElement: HTMLElement): Promise<AccessibilityTestResult> {
    return this.runFullTest(componentElement)
  }

  static generateReport(result: AccessibilityTestResult): string {
    const { issues, score, summary } = result
    
    let report = `Accessibility Test Report\n`
    report += `Score: ${score}/100\n`
    report += `Status: ${result.passed ? 'PASSED' : 'FAILED'}\n\n`
    
    report += `Summary:\n`
    report += `- Errors: ${summary.errors}\n`
    report += `- Warnings: ${summary.warnings}\n`
    report += `- Info: ${summary.info}\n\n`

    if (issues.length > 0) {
      report += `Issues Found:\n`
      issues.forEach((issue, index) => {
        report += `${index + 1}. [${issue.type.toUpperCase()}] ${issue.rule}\n`
        report += `   ${issue.message}\n`
        if (issue.element) {
          report += `   Element: ${issue.element.tagName.toLowerCase()}${issue.element.id ? `#${issue.element.id}` : ''}${issue.element.className ? `.${issue.element.className.split(' ').join('.')}` : ''}\n`
        }
        report += `   Severity: ${issue.severity}\n\n`
      })
    }

    return report
  }
}

// Automated testing utilities
export class AutomatedAccessibilityTesting {
  private static observer: MutationObserver | null = null

  static startContinuousMonitoring(container: HTMLElement, callback: (result: AccessibilityTestResult) => void) {
    // Stop existing observer
    this.stopContinuousMonitoring()

    // Create new observer
    this.observer = new MutationObserver(async (mutations) => {
      // Debounce the testing
      clearTimeout((this.observer as any).timeout)
      ;(this.observer as any).timeout = setTimeout(async () => {
        const result = await AccessibilityTester.runFullTest(container)
        callback(result)
      }, 500)
    })

    // Start observing
    this.observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-labelledby', 'aria-describedby', 'role', 'tabindex']
    })

    // Run initial test
    AccessibilityTester.runFullTest(container).then(callback)
  }

  static stopContinuousMonitoring() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  static async testAllComponents(container: HTMLElement): Promise<Map<string, AccessibilityTestResult>> {
    const results = new Map<string, AccessibilityTestResult>()
    
    // Find all component examples
    const componentExamples = container.querySelectorAll('[data-component-example]')
    
    for (const example of componentExamples) {
      const componentName = example.getAttribute('data-component-example') || 'unknown'
      const result = await AccessibilityTester.testComponent(example as HTMLElement)
      results.set(componentName, result)
    }

    return results
  }
}

// Screen reader testing utilities
export class ScreenReaderTester {
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  static testScreenReaderContent(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = []

    // Check for screen reader only content
    const srOnlyElements = element.querySelectorAll('.sr-only, [class*="sr-only"]')
    if (srOnlyElements.length === 0) {
      issues.push({
        type: 'info',
        rule: 'screen-reader-content',
        message: 'Consider adding screen reader only content for better accessibility',
        severity: 'minor'
      })
    }

    // Check for proper use of aria-hidden
    const hiddenElements = element.querySelectorAll('[aria-hidden="true"]')
    hiddenElements.forEach(hiddenEl => {
      if (hiddenEl.textContent?.trim()) {
        issues.push({
          type: 'warning',
          rule: 'aria-hidden-content',
          message: 'Element with aria-hidden="true" contains text content',
          element: hiddenEl as HTMLElement,
          severity: 'moderate'
        })
      }
    })

    return issues
  }
}