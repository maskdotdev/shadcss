# CVA to CSS Modules Conversion Patterns

This document provides comprehensive patterns for converting Class Variance Authority (CVA) configurations to CSS modules while maintaining the same functionality and API.

## Basic CVA Conversion Pattern

### Original CVA Structure
```typescript
import { cva, type VariantProps } from "class-variance-authority"

const componentVariants = cva(
  "base-classes here",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        destructive: "destructive-variant-classes",
        outline: "outline-variant-classes"
      },
      size: {
        default: "default-size-classes",
        sm: "small-size-classes",
        lg: "large-size-classes"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

### Converted CSS Module Structure
```typescript
import { cva, type VariantProps } from "class-variance-authority"
import styles from './component.module.css'

const componentVariants = cva(
  styles.component,
  {
    variants: {
      variant: {
        default: styles['variant-default'],
        destructive: styles['variant-destructive'],
        outline: styles['variant-outline']
      },
      size: {
        default: styles['size-default'],
        sm: styles['size-sm'],
        lg: styles['size-lg']
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

### Corresponding CSS Module
```css
/* Base component styles */
.component {
  /* Base classes converted to CSS properties */
}

/* Variant styles */
.variant-default {
  /* Default variant classes converted to CSS properties */
}

.variant-destructive {
  /* Destructive variant classes converted to CSS properties */
}

.variant-outline {
  /* Outline variant classes converted to CSS properties */
}

/* Size styles */
.size-default {
  /* Default size classes converted to CSS properties */
}

.size-sm {
  /* Small size classes converted to CSS properties */
}

.size-lg {
  /* Large size classes converted to CSS properties */
}
```

## Real-World Examples

### Button Component Conversion

#### Original Button CVA
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

#### Converted Button CVA
```typescript
import styles from './button.module.css'

const buttonVariants = cva(
  styles.button,
  {
    variants: {
      variant: {
        default: styles['variant-default'],
        destructive: styles['variant-destructive'],
        outline: styles['variant-outline'],
        secondary: styles['variant-secondary'],
        ghost: styles['variant-ghost'],
        link: styles['variant-link']
      },
      size: {
        default: styles['size-default'],
        sm: styles['size-sm'],
        lg: styles['size-lg'],
        icon: styles['size-icon']
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)
```

#### Button CSS Module
```css
/* Button Component CSS Module */

/* Base component styles */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
  outline: none;
}

.button:disabled {
  pointer-events: none;
  opacity: 0.5;
}

/* Variant styles */
.variant-default {
  background-color: var(--primary);
  color: var(--primary-foreground);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.variant-default:hover {
  background-color: var(--primary-hover, color-mix(in srgb, var(--primary) 90%, transparent));
}

.variant-destructive {
  background-color: var(--destructive);
  color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.variant-destructive:hover {
  background-color: var(--destructive-hover, color-mix(in srgb, var(--destructive) 90%, transparent));
}

.variant-outline {
  border: 1px solid var(--border);
  background-color: var(--background);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.variant-outline:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.variant-secondary {
  background-color: var(--secondary);
  color: var(--secondary-foreground);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.variant-secondary:hover {
  background-color: var(--secondary-hover, color-mix(in srgb, var(--secondary) 80%, transparent));
}

.variant-ghost:hover {
  background-color: var(--accent);
  color: var(--accent-foreground);
}

.variant-link {
  color: var(--primary);
  text-underline-offset: 4px;
}

.variant-link:hover {
  text-decoration: underline;
}

/* Size styles */
.size-default {
  height: 2.25rem;
  padding: 0.5rem 1rem;
}

.size-sm {
  height: 2rem;
  border-radius: 0.375rem;
  gap: 0.375rem;
  padding: 0 0.75rem;
}

.size-lg {
  height: 2.5rem;
  border-radius: 0.375rem;
  padding: 0 1.5rem;
}

.size-icon {
  width: 2.25rem;
  height: 2.25rem;
}
```

### Badge Component Conversion

#### Original Badge CVA
```typescript
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)
```

#### Converted Badge CVA
```typescript
import styles from './badge.module.css'

const badgeVariants = cva(
  styles.badge,
  {
    variants: {
      variant: {
        default: styles['variant-default'],
        secondary: styles['variant-secondary'],
        destructive: styles['variant-destructive'],
        outline: styles['variant-outline']
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)
```

## Complex CVA Patterns

### Compound Variants
```typescript
// Original with compound variants
const complexVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "variant-classes",
        special: "special-classes"
      },
      size: {
        sm: "small-classes",
        lg: "large-classes"
      }
    },
    compoundVariants: [
      {
        variant: "special",
        size: "lg",
        class: "special-large-classes"
      }
    ]
  }
)

// Converted to CSS modules
const complexVariants = cva(
  styles.component,
  {
    variants: {
      variant: {
        default: styles['variant-default'],
        special: styles['variant-special']
      },
      size: {
        sm: styles['size-sm'],
        lg: styles['size-lg']
      }
    },
    compoundVariants: [
      {
        variant: "special",
        size: "lg",
        class: styles['compound-special-lg']
      }
    ]
  }
)
```

### Conditional Classes with cn()
```typescript
// Original pattern
<Component
  className={cn(
    buttonVariants({ variant, size }),
    isActive && "active-classes",
    className
  )}
/>

// Converted pattern
<Component
  className={cn(
    buttonVariants({ variant, size }),
    isActive && styles.active,
    className
  )}
/>
```

## CSS Module Class Naming Conventions

### Variant Classes
- **Pattern**: `.variant-{variantName}`
- **Examples**: `.variant-default`, `.variant-destructive`, `.variant-outline`

### Size Classes
- **Pattern**: `.size-{sizeName}`
- **Examples**: `.size-sm`, `.size-default`, `.size-lg`, `.size-icon`

### State Classes
- **Pattern**: `.{stateName}` or `.state-{stateName}`
- **Examples**: `.active`, `.disabled`, `.loading`, `.state-hover`

### Compound Classes
- **Pattern**: `.compound-{variant}-{size}` or `.{variant}-{size}`
- **Examples**: `.compound-special-lg`, `.destructive-sm`

## Component Function Patterns

### Basic Component Function
```typescript
function Component({
  className,
  variant,
  size,
  ...props
}: ComponentProps & VariantProps<typeof componentVariants>) {
  return (
    <Element
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Component with Conditional Classes
```typescript
function Component({
  className,
  variant,
  size,
  disabled,
  active,
  ...props
}: ComponentProps & VariantProps<typeof componentVariants> & {
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Element
      className={cn(
        componentVariants({ variant, size }),
        disabled && styles.disabled,
        active && styles.active,
        className
      )}
      {...props}
    />
  )
}
```

### Component with Slot Pattern
```typescript
function Component({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps & VariantProps<typeof componentVariants> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button"
  
  return (
    <Comp
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

## Advanced Patterns

### Multiple Base Classes
```typescript
// When CVA has multiple base classes that need different CSS module classes
const componentVariants = cva(
  [styles.component, styles.interactive, styles.focusable],
  {
    variants: {
      variant: {
        default: styles['variant-default']
      }
    }
  }
)
```

### Dynamic Class Names
```typescript
// For dynamic variant names
const getVariantClass = (variant: string) => {
  return styles[`variant-${variant}`] || styles['variant-default']
}

const componentVariants = cva(
  styles.component,
  {
    variants: {
      variant: {
        default: getVariantClass('default'),
        custom: getVariantClass('custom')
      }
    }
  }
)
```

### Nested Component Patterns
```typescript
// For compound components with shared styles
const cardVariants = cva(styles.card)
const cardHeaderVariants = cva(styles['card-header'])
const cardContentVariants = cva(styles['card-content'])

function Card({ className, ...props }) {
  return (
    <div className={cn(cardVariants(), className)} {...props} />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn(cardHeaderVariants(), className)} {...props} />
  )
}
```

## Migration Checklist

### Pre-Conversion
- [ ] Identify all CVA configurations in the component
- [ ] Extract all variant types and their values
- [ ] Note any compound variants or complex patterns
- [ ] Document any conditional class applications

### During Conversion
- [ ] Create CSS module file with proper naming conventions
- [ ] Convert base classes to `.component` class
- [ ] Convert variants to `.variant-{name}` classes
- [ ] Convert sizes to `.size-{name}` classes
- [ ] Update CVA configuration to use CSS module references
- [ ] Add CSS module import statement

### Post-Conversion
- [ ] Verify all variants render correctly
- [ ] Test all size combinations
- [ ] Validate responsive behavior
- [ ] Check dark mode compatibility
- [ ] Ensure TypeScript types are preserved
- [ ] Test component composition patterns

## Common Pitfalls and Solutions

### Issue: Class Name Conflicts
**Problem**: CSS module class names conflict with global styles
**Solution**: Use descriptive, component-specific class names

### Issue: Dynamic Class Names
**Problem**: Dynamic class names don't work with CSS modules
**Solution**: Use object mapping or conditional logic

```typescript
// Instead of
className={styles[`variant-${dynamicVariant}`]}

// Use
const variantClasses = {
  default: styles['variant-default'],
  destructive: styles['variant-destructive']
}
className={variantClasses[dynamicVariant] || variantClasses.default}
```

### Issue: Complex Selectors
**Problem**: Complex Tailwind selectors don't convert cleanly
**Solution**: Break down into simpler CSS rules or use CSS nesting

### Issue: Pseudo-selectors
**Problem**: Pseudo-selectors in Tailwind classes need special handling
**Solution**: Convert to proper CSS pseudo-selectors in the module

This comprehensive guide ensures consistent and maintainable CVA to CSS module conversions across all shadcn/ui components.