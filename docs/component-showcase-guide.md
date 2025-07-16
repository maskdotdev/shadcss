# Component Showcase Guide

## Overview

The Component Showcase is a comprehensive documentation and testing environment for UI components. It provides live examples, code snippets, dependency information, and interactive demonstrations for all available components from both the original shadcn/ui library and the CSS modules version (shadcss-ui).

## Features

### 🎯 Core Features

- **Live Component Previews**: Interactive examples with all variants and states
- **Code Examples**: Copy-paste ready code snippets with proper imports
- **Dependency Information**: Complete dependency trees and installation guides
- **Version Switching**: Toggle between original and CSS modules versions
- **Advanced Search**: Fuzzy search with filters and suggestions
- **Accessibility Testing**: Built-in accessibility validation and testing
- **Performance Monitoring**: Real-time performance metrics and optimization suggestions

### 🚀 Advanced Features

- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Lazy Loading**: Performance-optimized component loading
- **Virtual Scrolling**: Efficient rendering for large component lists
- **Bundle Analysis**: Bundle size optimization recommendations

## Getting Started

### Navigation

The showcase is organized into several main areas:

1. **Sidebar Navigation**: Alphabetically sorted component list with search and filters
2. **Main Content Area**: Component details with tabbed interface
3. **Header**: Breadcrumb navigation and mobile controls

### Basic Usage

1. **Browse Components**: Use the sidebar to browse all available components
2. **Search**: Use the search bar to find specific components by name, description, or category
3. **Filter**: Apply category or dependency filters to narrow down results
4. **Select Component**: Click on any component to view its details

### Component Details

Each component page includes four main tabs:

#### Preview Tab
- Live interactive examples
- Variant selector for different component styles
- Version toggle (original vs CSS modules)
- Interactive state management for stateful components

#### Code Tab
- Complete code examples with imports
- Copy-to-clipboard functionality
- Multiple example variations
- Installation instructions

#### Dependencies Tab
- Complete dependency tree
- Version information and compatibility
- Installation commands for npm/yarn/pnpm
- Links to official documentation

#### Accessibility Tab
- Automated accessibility testing
- WCAG compliance validation
- Keyboard navigation testing
- Screen reader compatibility

## Component Categories

### Basic Components
Essential form controls and basic UI elements:
- Button, Input, Label, Textarea
- Checkbox, Radio Group, Switch
- Select, Slider, Progress

### Layout Components
Components for structuring and organizing content:
- Card, Separator, Aspect Ratio
- Resizable, Scroll Area, Skeleton

### Feedback Components
User feedback and notification components:
- Alert, Badge, Progress
- Sonner (Toast notifications)

### Navigation Components
Navigation and wayfinding components:
- Breadcrumb, Navigation Menu, Pagination
- Tabs, Menubar

### Data Components
Data display and manipulation components:
- Table, Calendar, Chart
- Command (Command palette)

### Overlay Components
Modal dialogs and overlay components:
- Dialog, Alert Dialog, Sheet
- Popover, Hover Card, Tooltip
- Dropdown Menu, Context Menu

## Using Components

### Installation

#### Original shadcn/ui Components
```bash
# Install a specific component
npx shadcn-ui@latest add button

# Install multiple components
npx shadcn-ui@latest add button input card
```

#### CSS Modules Components
```bash
# Components are already available in the project
import { Button } from '@/components/shadcss-ui/button'
```

### Basic Example

```tsx
import { Button } from '@/components/shadcss-ui/button'

export function MyComponent() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}
```

### Advanced Usage

#### With State Management
```tsx
import { useState } from 'react'
import { Button } from '@/components/shadcss-ui/button'
import { Input } from '@/components/shadcss-ui/input'

export function FormExample() {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-4">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter text..."
      />
      <Button onClick={() => console.log(value)}>
        Submit
      </Button>
    </div>
  )
}
```

#### With Form Validation
```tsx
import { useForm } from 'react-hook-form'
import { Button } from '@/components/shadcss-ui/button'
import { Input } from '@/components/shadcss-ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcss-ui/form'

export function ValidatedForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## Keyboard Shortcuts

The showcase includes comprehensive keyboard navigation:

### Navigation
- `/` or `Ctrl+K` / `Cmd+K`: Focus search input
- `Alt+→`: Next component
- `Alt+←`: Previous component
- `Escape`: Go back or clear search

### Tabs
- `1`: Switch to Preview tab
- `2`: Switch to Code tab
- `3`: Switch to Dependencies tab
- `4`: Switch to Accessibility tab

### Actions
- `Ctrl+C` / `Cmd+C`: Copy current code
- `Ctrl+S` / `Cmd+S`: Toggle sidebar
- `?`: Show keyboard shortcuts help

## Search and Filtering

### Search Features
- **Fuzzy Search**: Finds components even with typos
- **Multi-field Search**: Searches names, descriptions, categories, and dependencies
- **Search History**: Remembers recent searches
- **Search Suggestions**: Provides autocomplete suggestions

### Filter Options
- **Category Filter**: Filter by component category
- **Dependency Filter**: Filter by underlying libraries (Radix UI, CMDK, etc.)
- **Version Filter**: Show only components with specific versions available

### Search Tips
- Use specific terms for better results
- Try category names like "basic", "layout", "overlay"
- Search for dependencies like "radix", "cmdk", "sonner"
- Use partial matches like "but" to find "button"

## Best Practices

### Component Usage
1. **Import Optimization**: Import only the components you need
2. **Version Consistency**: Stick to one version (original or CSS modules) per project
3. **Accessibility**: Always test components with keyboard navigation and screen readers
4. **Performance**: Use lazy loading for heavy components

### Code Organization
```tsx
// Good: Organized imports
import { Button } from '@/components/shadcss-ui/button'
import { Input } from '@/components/shadcss-ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcss-ui/card'

// Good: Consistent naming
export function UserProfileCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  )
}
```

### Styling Guidelines
```tsx
// Good: Use CSS modules classes
import styles from './component.module.css'
import { Button } from '@/components/shadcss-ui/button'

export function StyledComponent() {
  return (
    <div className={styles.container}>
      <Button className={styles.primaryButton}>
        Click me
      </Button>
    </div>
  )
}
```

## Troubleshooting

### Common Issues

#### Component Not Rendering
```tsx
// Problem: Missing import
<Button>Click me</Button> // Error: Button is not defined

// Solution: Add proper import
import { Button } from '@/components/shadcss-ui/button'
<Button>Click me</Button>
```

#### Styling Issues
```tsx
// Problem: Conflicting styles
<Button className="my-custom-class">Button</Button>

// Solution: Use CSS modules or ensure proper specificity
import styles from './styles.module.css'
<Button className={styles.customButton}>Button</Button>
```

#### TypeScript Errors
```tsx
// Problem: Missing prop types
<Button variant="custom">Button</Button> // Error: 'custom' is not assignable

// Solution: Use valid variant
<Button variant="secondary">Button</Button>
```

### Performance Issues

#### Slow Loading
- Enable lazy loading for heavy components
- Use code splitting for large bundles
- Optimize images and assets

#### Memory Usage
- Monitor component re-renders
- Use React.memo for expensive components
- Clean up event listeners and subscriptions

### Accessibility Issues

#### Keyboard Navigation
- Ensure all interactive elements are focusable
- Provide proper tab order
- Add skip links for complex layouts

#### Screen Reader Support
- Use proper ARIA labels and descriptions
- Provide alternative text for images
- Ensure semantic HTML structure

## Advanced Features

### Custom Themes
```tsx
// Create custom theme variants
import { Button } from '@/components/shadcss-ui/button'
import { cn } from '@/lib/utils'

const customButtonVariants = {
  brand: 'bg-brand-500 text-white hover:bg-brand-600',
  success: 'bg-green-500 text-white hover:bg-green-600'
}

export function CustomButton({ variant, className, ...props }) {
  return (
    <Button
      className={cn(customButtonVariants[variant], className)}
      {...props}
    />
  )
}
```

### Component Composition
```tsx
// Compose components for complex UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Button } from '@/components/shadcss-ui/button'
import { Badge } from '@/components/shadcss-ui/badge'

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant={product.inStock ? 'default' : 'secondary'}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${product.price}</span>
          <Button disabled={!product.inStock}>
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Contributing

### Adding New Components
1. Create component in appropriate directory
2. Add to component registry
3. Create examples and documentation
4. Add tests and accessibility validation

### Reporting Issues
- Use the GitHub issue tracker
- Provide minimal reproduction examples
- Include browser and version information
- Describe expected vs actual behavior

### Feature Requests
- Check existing issues first
- Provide detailed use cases
- Consider implementation complexity
- Discuss with maintainers

## Resources

### Documentation
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://radix-ui.com)
- [React Hook Form](https://react-hook-form.com)

### Tools
- [Storybook](https://storybook.js.org) - Component development
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debugging
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibility testing

### Community
- [GitHub Discussions](https://github.com/shadcn-ui/ui/discussions)
- [Discord Community](https://discord.gg/shadcn)
- [Twitter Updates](https://twitter.com/shadcn)

## FAQ

### Q: Which version should I use - original or CSS modules?
A: Use CSS modules version if you want better performance and smaller bundle sizes. Use original version if you prefer the traditional shadcn/ui approach.

### Q: Can I mix both versions in the same project?
A: It's not recommended as it can lead to styling conflicts and increased bundle size. Choose one version and stick with it.

### Q: How do I customize component styles?
A: For CSS modules version, modify the corresponding `.module.css` file. For original version, update your global CSS or use Tailwind classes.

### Q: Are all components accessible?
A: Yes, all components are built with accessibility in mind and follow WCAG guidelines. Use the accessibility tab to validate specific implementations.

### Q: How do I report bugs or request features?
A: Use the GitHub issue tracker with detailed information about the problem or feature request.

### Q: Can I use these components in commercial projects?
A: Yes, all components are open source and can be used in commercial projects. Check the license for specific terms.