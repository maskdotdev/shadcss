/**
 * Interactive tutorials for the component showcase
 */

import React from 'react'
import { Tutorial } from '../components/InteractiveTutorial'
import { Button } from '@/components/shadcss-ui/button'
import { Input } from '@/components/shadcss-ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcss-ui/card'
import { Badge } from '@/components/shadcss-ui/badge'
import { Alert, AlertDescription } from '@/components/shadcss-ui/alert'
import { Code } from 'lucide-react'

export const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Component Showcase',
    description: 'Learn the basics of navigating and using the component showcase',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: 5,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Component Showcase',
        description: 'Let\'s explore the main features of the component showcase',
        content: (
          <div className="space-y-4">
            <p>Welcome to the Component Showcase! This interactive guide will help you learn how to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Navigate through components</li>
              <li>View live examples and code</li>
              <li>Copy code snippets</li>
              <li>Search and filter components</li>
              <li>Switch between component versions</li>
            </ul>
            <Alert>
              <AlertDescription>
                This tutorial will take approximately 5 minutes to complete.
              </AlertDescription>
            </Alert>
          </div>
        ),
        duration: 3000
      },
      {
        id: 'sidebar-navigation',
        title: 'Sidebar Navigation',
        description: 'The sidebar shows all available components organized alphabetically',
        target: '#sidebar',
        content: (
          <div className="space-y-3">
            <p>The sidebar on the left contains all available components:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Components are listed alphabetically</li>
              <li>Each component shows its category and dependencies</li>
              <li>Click any component to view its details</li>
            </ul>
          </div>
        ),
        hints: [
          'Look for the component list on the left side of the screen',
          'Each component shows colored dots indicating available versions'
        ]
      },
      {
        id: 'search-functionality',
        title: 'Search Components',
        description: 'Use the search bar to quickly find components',
        target: '#search-input',
        action: 'type',
        actionData: { text: 'button' },
        content: (
          <div className="space-y-3">
            <p>The search bar helps you find components quickly:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Search by component name, description, or category</li>
              <li>Use fuzzy search - typos are okay!</li>
              <li>Try searching for "button" to see it in action</li>
            </ul>
          </div>
        ),
        hints: [
          'The search bar is at the top of the sidebar',
          'Try typing "but" to find button-related components'
        ]
      },
      {
        id: 'component-tabs',
        title: 'Component Detail Tabs',
        description: 'Each component has four main tabs with different information',
        content: (
          <div className="space-y-3">
            <p>When you select a component, you'll see four tabs:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 border rounded">
                <strong>Preview:</strong> Live examples
              </div>
              <div className="p-2 border rounded">
                <strong>Code:</strong> Copy-paste snippets
              </div>
              <div className="p-2 border rounded">
                <strong>Dependencies:</strong> Installation info
              </div>
              <div className="p-2 border rounded">
                <strong>Accessibility:</strong> A11y testing
              </div>
            </div>
          </div>
        ),
        hints: [
          'Tabs are located at the top of the main content area',
          'Each tab provides different types of information about the component'
        ]
      },
      {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        description: 'Learn useful keyboard shortcuts for faster navigation',
        content: (
          <div className="space-y-3">
            <p>Use these keyboard shortcuts for faster navigation:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Focus search</span>
                <Badge variant="outline">/ or Ctrl+K</Badge>
              </div>
              <div className="flex justify-between">
                <span>Next component</span>
                <Badge variant="outline">Alt+→</Badge>
              </div>
              <div className="flex justify-between">
                <span>Previous component</span>
                <Badge variant="outline">Alt+←</Badge>
              </div>
              <div className="flex justify-between">
                <span>Copy code</span>
                <Badge variant="outline">Ctrl+C</Badge>
              </div>
            </div>
          </div>
        ),
        hints: [
          'Press ? to see all available keyboard shortcuts',
          'Keyboard shortcuts work from anywhere in the showcase'
        ]
      }
    ]
  },
  {
    id: 'button-component-deep-dive',
    title: 'Button Component Deep Dive',
    description: 'Learn everything about the Button component and its variants',
    category: 'components',
    difficulty: 'beginner',
    estimatedTime: 8,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'button-overview',
        title: 'Button Component Overview',
        description: 'Understanding the Button component and its use cases',
        content: (
          <div className="space-y-4">
            <p>The Button component is one of the most fundamental UI elements:</p>
            <div className="space-y-2">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Buttons trigger actions, submit forms, and navigate between pages.
            </p>
          </div>
        )
      },
      {
        id: 'button-variants',
        title: 'Button Variants',
        description: 'Explore different button styles and when to use them',
        content: (
          <div className="space-y-4">
            <p>The Button component comes with several variants:</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Button variant="default" className="w-full">Default</Button>
                <p className="text-xs text-muted-foreground">Primary actions</p>
              </div>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full">Secondary</Button>
                <p className="text-xs text-muted-foreground">Secondary actions</p>
              </div>
              <div className="space-y-2">
                <Button variant="destructive" className="w-full">Destructive</Button>
                <p className="text-xs text-muted-foreground">Delete/remove actions</p>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">Outline</Button>
                <p className="text-xs text-muted-foreground">Subtle actions</p>
              </div>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full">Ghost</Button>
                <p className="text-xs text-muted-foreground">Minimal actions</p>
              </div>
              <div className="space-y-2">
                <Button variant="link" className="w-full">Link</Button>
                <p className="text-xs text-muted-foreground">Link-style actions</p>
              </div>
            </div>
          </div>
        ),
        hints: [
          'Each variant serves a different purpose in your UI hierarchy',
          'Use destructive variant sparingly for important delete actions'
        ]
      },
      {
        id: 'button-sizes',
        title: 'Button Sizes',
        description: 'Learn about different button sizes and their use cases',
        content: (
          <div className="space-y-4">
            <p>Buttons come in different sizes for various contexts:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button size="sm">Small</Button>
                <span className="text-sm text-muted-foreground">Compact spaces, secondary actions</span>
              </div>
              <div className="flex items-center gap-3">
                <Button size="default">Default</Button>
                <span className="text-sm text-muted-foreground">Standard size for most use cases</span>
              </div>
              <div className="flex items-center gap-3">
                <Button size="lg">Large</Button>
                <span className="text-sm text-muted-foreground">Prominent actions, hero sections</span>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon">
                  <Code className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">Icon-only buttons</span>
              </div>
            </div>
          </div>
        ),
        hints: [
          'Choose button size based on the importance and context of the action',
          'Icon buttons should always have proper aria-labels for accessibility'
        ]
      },
      {
        id: 'button-states',
        title: 'Button States',
        description: 'Understanding different button states and interactions',
        content: (
          <div className="space-y-4">
            <p>Buttons have various states to provide user feedback:</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Button>Normal</Button>
                <span className="text-sm text-muted-foreground">Default interactive state</span>
              </div>
              <div className="flex items-center gap-3">
                <Button disabled>Disabled</Button>
                <span className="text-sm text-muted-foreground">Action not available</span>
              </div>
              <div className="flex items-center gap-3">
                <Button className="opacity-75">Loading</Button>
                <span className="text-sm text-muted-foreground">Action in progress</span>
              </div>
            </div>
            <Alert>
              <AlertDescription>
                Always provide visual feedback for button states to improve user experience.
              </AlertDescription>
            </Alert>
          </div>
        ),
        hints: [
          'Disabled buttons should clearly indicate why they\'re disabled',
          'Loading states help users understand that their action is being processed'
        ]
      },
      {
        id: 'button-code-example',
        title: 'Button Code Examples',
        description: 'See how to implement buttons in your code',
        content: (
          <div className="space-y-4">
            <p>Here's how to use the Button component in your code:</p>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Basic Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`import { Button } from '@/components/shadcss-ui/button'

export function MyComponent() {
  return (
    <div className="space-x-2">
      <Button>Click me</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}`}
                </pre>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground">
              Copy this code and paste it into your component to get started!
            </p>
          </div>
        ),
        hints: [
          'Always import the Button component from the correct path',
          'Use the variant prop to change the button style'
        ]
      }
    ]
  },
  {
    id: 'form-components-tutorial',
    title: 'Building Forms with Components',
    description: 'Learn how to create forms using Input, Button, and validation',
    category: 'components',
    difficulty: 'intermediate',
    estimatedTime: 12,
    prerequisites: ['getting-started', 'button-component-deep-dive'],
    steps: [
      {
        id: 'form-overview',
        title: 'Form Components Overview',
        description: 'Understanding the components needed for forms',
        content: (
          <div className="space-y-4">
            <p>Forms are built using several components working together:</p>
            <div className="grid grid-cols-1 gap-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Input</CardTitle>
                  <CardDescription className="text-xs">Text input fields</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input placeholder="Enter your name" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Button</CardTitle>
                  <CardDescription className="text-xs">Form submission</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button>Submit Form</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      },
      {
        id: 'basic-form',
        title: 'Creating a Basic Form',
        description: 'Build a simple form with validation',
        content: (
          <div className="space-y-4">
            <p>Let's create a basic contact form:</p>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Form</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input placeholder="Your name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="your@email.com" className="mt-1" />
                </div>
                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>
          </div>
        ),
        hints: [
          'Always use proper input types (email, tel, etc.) for better UX',
          'Labels should be associated with their inputs for accessibility'
        ]
      },
      {
        id: 'form-validation',
        title: 'Form Validation',
        description: 'Adding validation and error handling',
        content: (
          <div className="space-y-4">
            <p>Good forms provide clear validation feedback:</p>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Form with Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="mt-1 border-red-500" 
                  />
                  <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Password *</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="mt-1" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
                </div>
                <Button className="w-full">Create Account</Button>
              </CardContent>
            </Card>
          </div>
        ),
        hints: [
          'Use red borders and text to indicate validation errors',
          'Provide helpful error messages that explain how to fix the issue'
        ]
      }
    ]
  },
  {
    id: 'accessibility-best-practices',
    title: 'Accessibility Best Practices',
    description: 'Learn how to make your components accessible to all users',
    category: 'accessibility',
    difficulty: 'intermediate',
    estimatedTime: 15,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'accessibility-overview',
        title: 'Why Accessibility Matters',
        description: 'Understanding the importance of accessible design',
        content: (
          <div className="space-y-4">
            <p>Accessibility ensures your components work for everyone:</p>
            <div className="grid grid-cols-1 gap-3">
              <Alert>
                <AlertDescription>
                  <strong>15% of the world's population</strong> lives with some form of disability.
                </AlertDescription>
              </Alert>
              <div className="space-y-2 text-sm">
                <p><strong>Visual:</strong> Screen readers, high contrast, magnification</p>
                <p><strong>Motor:</strong> Keyboard navigation, voice control</p>
                <p><strong>Cognitive:</strong> Clear language, consistent patterns</p>
                <p><strong>Auditory:</strong> Visual indicators, captions</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'keyboard-navigation',
        title: 'Keyboard Navigation',
        description: 'Ensuring all interactive elements are keyboard accessible',
        content: (
          <div className="space-y-4">
            <p>All interactive elements must be keyboard accessible:</p>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <p className="text-sm font-medium mb-2">Try navigating with Tab:</p>
                <div className="space-x-2">
                  <Button size="sm">Button 1</Button>
                  <Button size="sm" variant="secondary">Button 2</Button>
                  <Input placeholder="Input field" className="w-32 inline-block" />
                </div>
              </div>
              <Alert>
                <AlertDescription>
                  Use Tab to move forward, Shift+Tab to move backward, Enter/Space to activate.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        ),
        hints: [
          'Test your components using only the keyboard',
          'Ensure focus indicators are clearly visible'
        ]
      },
      {
        id: 'aria-labels',
        title: 'ARIA Labels and Descriptions',
        description: 'Using ARIA attributes to provide context for screen readers',
        content: (
          <div className="space-y-4">
            <p>ARIA attributes help screen readers understand your components:</p>
            <div className="space-y-3">
              <div className="p-3 border rounded">
                <Button 
                  size="icon" 
                  aria-label="Close dialog"
                  className="mb-2"
                >
                  ×
                </Button>
                <p className="text-xs text-muted-foreground">
                  This button has an aria-label for screen readers
                </p>
              </div>
              <div className="p-3 border rounded">
                <Input 
                  placeholder="Search..." 
                  aria-describedby="search-help"
                  className="mb-1"
                />
                <p id="search-help" className="text-xs text-muted-foreground">
                  Type to search through components
                </p>
              </div>
            </div>
          </div>
        ),
        hints: [
          'Use aria-label for elements without visible text',
          'Use aria-describedby to provide additional context'
        ]
      }
    ]
  }
]

export function getTutorialById(id: string): Tutorial | undefined {
  return TUTORIALS.find(tutorial => tutorial.id === id)
}

export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return TUTORIALS.filter(tutorial => tutorial.category === category)
}

export function getTutorialsByDifficulty(difficulty: Tutorial['difficulty']): Tutorial[] {
  return TUTORIALS.filter(tutorial => tutorial.difficulty === difficulty)
}

export default TUTORIALS