# CSS Module Conversion Patterns

This document defines the standardized patterns for converting shadcn/ui components from Tailwind CSS to CSS modules.

## CSS Class Naming Conventions

### Base Component Classes
- Use the component name as the base class: `.button`, `.card`, `.badge`
- Use kebab-case for multi-word components: `.alert-dialog`, `.dropdown-menu`

### Variant Classes
- Prefix with `variant-`: `.variant-default`, `.variant-destructive`, `.variant-outline`
- Use descriptive names that match the original variant keys
- Maintain consistency across components for common variants

### Size Classes
- Prefix with `size-`: `.size-sm`, `.size-default`, `.size-lg`, `.size-icon`
- Use standard size naming: `xs`, `sm`, `default`, `lg`, `xl`, `2xl`

### State Classes
- Use descriptive state names: `.disabled`, `.active`, `.checked`, `.focused`
- Combine with pseudo-selectors when appropriate: `.button:hover`, `.button:focus`

### Compound Component Classes
- Use component name + sub-component: `.card-header`, `.card-content`, `.card-footer`
- Maintain hierarchical relationship in naming

### Utility Classes
- Prefix with purpose: `.spacing-sm`, `.color-primary`, `.text-sm`
- Group related utilities together in the CSS file

## CSS Module File Structure

### Template Structure
```css
/* Base component styles */
.componentName {
  /* Core styles that apply to all variants */
}

/* Variant styles */
.variant-default {
  /* Default variant styles */
}

.variant-destructive {
  /* Destructive variant styles */
}

.variant-outline {
  /* Outline variant styles */
}

/* Size styles */
.size-sm {
  /* Small size styles */
}

.size-default {
  /* Default size styles */
}

.size-lg {
  /* Large size styles */
}

/* State styles */
.componentName:hover {
  /* Hover state styles */
}

.componentName:focus {
  /* Focus state styles */
}

.componentName:disabled {
  /* Disabled state styles */
}

/* Compound component styles (if applicable) */
.componentName-header {
  /* Sub-component styles */
}

.componentName-content {
  /* Sub-component styles */
}

/* Responsive styles */
@media (min-width: 640px) {
  .componentName {
    /* Small screen and up */
  }
}

@media (min-width: 768px) {
  .componentName {
    /* Medium screen and up */
  }
}

@media (min-width: 1024px) {
  .componentName {
    /* Large screen and up */
  }
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .componentName {
    /* Dark mode styles */
  }
}

/* CSS Custom Properties for theming */
.componentName {
  --component-bg: var(--background);
  --component-fg: var(--foreground);
  --component-border: var(--border);
}
```

## CVA (Class Variance Authority) Conversion Patterns

### Original CVA Pattern
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "variant-classes",
        destructive: "destructive-classes"
      },
      size: {
        default: "size-classes",
        sm: "small-classes"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

### Converted CSS Module Pattern
```typescript
import styles from './component.module.css'

const componentVariants = cva(
  styles.component,
  {
    variants: {
      variant: {
        default: styles['variant-default'],
        destructive: styles['variant-destructive']
      },
      size: {
        default: styles['size-default'],
        sm: styles['size-sm']
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

### Class Name Mapping Rules
1. Base classes → `.component` class in CSS module
2. Variant classes → `.variant-{name}` classes
3. Size classes → `.size-{name}` classes
4. Compound classes → Space-separated class combinations
5. Conditional classes → Separate CSS classes with appropriate selectors

## Component Code Transformation Patterns

### Import Statement Updates
```typescript
// Add CSS module import
import styles from './component-name.module.css'

// Keep existing imports
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
```

### CVA Configuration Updates
```typescript
// Replace string classes with CSS module references
const componentVariants = cva(
  styles.componentName, // Base class
  {
    variants: {
      variant: {
        default: styles['variant-default'],
        destructive: styles['variant-destructive'],
        // ... other variants
      },
      size: {
        default: styles['size-default'],
        sm: styles['size-sm'],
        // ... other sizes
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

### Component Function Updates
```typescript
function Component({
  className,
  variant,
  size,
  ...props
}: ComponentProps) {
  return (
    <Element
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

## CSS Generation Rules

### Tailwind to CSS Conversion
1. Extract all Tailwind classes from component files
2. Generate corresponding CSS using Tailwind CLI
3. Organize generated CSS into logical groups
4. Apply CSS module naming conventions
5. Add CSS custom properties for theming
6. Preserve responsive and state-based styles

### CSS Organization Principles
1. **Logical Grouping**: Group related styles together
2. **Cascade Order**: Base → Variants → Sizes → States → Media Queries
3. **Specificity Management**: Use appropriate selector specificity
4. **Performance**: Minimize redundant styles and optimize selectors
5. **Maintainability**: Clear structure and consistent naming

## File Organization Patterns

### Directory Structure
```
src/components/shadcss-ui/
├── component-name/
│   ├── index.tsx          # Component implementation
│   └── component-name.module.css  # CSS module styles
```

### Export Patterns
```typescript
// index.tsx
export { Component, componentVariants } from './component'
export type { ComponentProps } from './component'
```

## Validation Rules

### CSS Module Validation
1. All classes must be valid CSS identifiers
2. No duplicate class names within a module
3. Proper CSS syntax and formatting
4. Consistent naming conventions
5. Complete coverage of all variants and states

### Component Validation
1. All original props and functionality preserved
2. TypeScript interfaces remain unchanged
3. Export signatures match original components
4. No breaking changes to public API
5. Visual appearance matches original components

## Common Patterns and Edge Cases

### Complex Selectors
```css
/* Handle complex Tailwind selectors */
.component [&_svg]:not([class*='size-']) {
  width: 1rem;
  height: 1rem;
}

.component [&_svg] {
  pointer-events: none;
  flex-shrink: 0;
}
```

### Conditional Classes
```typescript
// Handle conditional class application
className={cn(
  styles.component,
  variant && styles[`variant-${variant}`],
  size && styles[`size-${size}`],
  disabled && styles.disabled,
  className
)}
```

### Compound Components
```css
/* Handle compound component styling */
.card {
  /* Card base styles */
}

.card-header {
  /* Card header specific styles */
}

.card-content {
  /* Card content specific styles */
}
```

### Dark Mode Support
```css
/* Use CSS custom properties for theme support */
.component {
  background-color: var(--component-bg, #ffffff);
  color: var(--component-fg, #000000);
}

@media (prefers-color-scheme: dark) {
  .component {
    --component-bg: #1a1a1a;
    --component-fg: #ffffff;
  }
}
```

This pattern document serves as the foundation for all CSS module conversions, ensuring consistency and maintainability across the entire component library.