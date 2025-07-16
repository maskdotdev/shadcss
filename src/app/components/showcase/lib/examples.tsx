import React from 'react'
import { ComponentExample, ComponentVersion } from './types'

// Import components from both versions
import { Button as OriginalButton } from '@/components/ui/button'
import { Badge as OriginalBadge } from '@/components/ui/badge'
import { Alert as OriginalAlert, AlertDescription as OriginalAlertDescription } from '@/components/ui/alert'

import { Button as CssButton } from '@/components/shadcss-ui/button'
import { Badge as CssBadge } from '@/components/shadcss-ui/badge'
import { Alert as CssAlert, AlertDescription as CssAlertDescription } from '@/components/shadcss-ui/alert'

function getComponents(version: ComponentVersion) {
  return version === 'original' ? {
    Button: OriginalButton,
    Badge: OriginalBadge,
    Alert: OriginalAlert,
    AlertDescription: OriginalAlertDescription,
  } : {
    Button: CssButton,
    Badge: CssBadge,
    Alert: CssAlert,
    AlertDescription: CssAlertDescription,
  }
}

export function createButtonExamples(version: ComponentVersion): ComponentExample[] {
  const { Button } = getComponents(version)
  
  return [
    {
      title: 'Button Variants',
      description: 'Different button styles and variants',
      code: `import { Button } from "@/components/${version === 'original' ? 'ui' : 'shadcss-ui'}/button"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}`,
      component: function ButtonVariantsDemo() {
        return (
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        )
      }
    }
  ]
}

export function createBadgeExamples(version: ComponentVersion): ComponentExample[] {
  const { Badge } = getComponents(version)
  
  return [
    {
      title: 'Badge Variants',
      description: 'Different badge styles and variants',
      code: `import { Badge } from "@/components/${version === 'original' ? 'ui' : 'shadcss-ui'}/badge"

export function BadgeDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}`,
      component: function BadgeVariantsDemo() {
        return (
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        )
      }
    }
  ]
}

export function createAlertExamples(version: ComponentVersion): ComponentExample[] {
  const { Alert, AlertDescription } = getComponents(version)
  
  return [
    {
      title: 'Basic Alert',
      description: 'Simple alert with description',
      code: `import { Alert, AlertDescription } from "@/components/${version === 'original' ? 'ui' : 'shadcss-ui'}/alert"

export function AlertDemo() {
  return (
    <Alert>
      <AlertDescription>
        This is a basic alert message.
      </AlertDescription>
    </Alert>
  )
}`,
      component: function BasicAlertDemo() {
        return (
          <Alert>
            <AlertDescription>
              This is a basic alert message.
            </AlertDescription>
          </Alert>
        )
      }
    }
  ]
}

export function getComponentExamples(componentId: string, version: ComponentVersion): ComponentExample[] {
  switch (componentId) {
    case 'button':
      return createButtonExamples(version)
    case 'badge':
      return createBadgeExamples(version)
    case 'alert':
      return createAlertExamples(version)
    default:
      return []
  }
}

export const exampleCreators = {
  button: createButtonExamples,
  badge: createBadgeExamples,
  alert: createAlertExamples,
}