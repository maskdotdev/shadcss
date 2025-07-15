"use client"

import { useState } from "react"
import { Button } from "@/components/shadcss-ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/shadcss-ui/card"
import { Input } from "@/components/shadcss-ui/input"
import { Label } from "@/components/shadcss-ui/label"
import { Checkbox } from "@/components/shadcss-ui/checkbox"
import { Switch } from "@/components/shadcss-ui/switch"
import { Separator } from "@/components/shadcss-ui/separator"
import { Badge } from "@/components/shadcss-ui/badge"
import { Progress } from "@/components/shadcss-ui/progress"
import { Textarea } from "@/components/shadcss-ui/textarea"
import { Slider } from "@/components/shadcss-ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/shadcss-ui/radio-group"

const basicComponents = [
  { id: 'button', name: 'Button', description: 'Clickable button component' },
  { id: 'input', name: 'Input', description: 'Text input field' },
  { id: 'label', name: 'Label', description: 'Form field label' },
  { id: 'textarea', name: 'Textarea', description: 'Multi-line text input' },
  { id: 'checkbox', name: 'Checkbox', description: 'Checkbox input' },
  { id: 'switch', name: 'Switch', description: 'Toggle switch' },
  { id: 'radio-group', name: 'Radio Group', description: 'Single choice selection' },
  { id: 'slider', name: 'Slider', description: 'Range input slider' },
  { id: 'separator', name: 'Separator', description: 'Content divider' },
  { id: 'badge', name: 'Badge', description: 'Small status indicators' },
  { id: 'progress', name: 'Progress', description: 'Show completion progress' },
]

export default function BasicComponentsPage() {
  const [activeComponent, setActiveComponent] = useState('button')
  const [isChecked, setIsChecked] = useState(false)
  const [isSwitchOn, setIsSwitchOn] = useState(false)

  const getComponentPreview = (componentId: string) => {
    switch (componentId) {
      case 'button':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
            </div>
          </div>
        )
      case 'input':
        return (
          <div className="space-y-4 max-w-md">
            <div>
              <Label htmlFor="text">Text Input</Label>
              <Input id="text" placeholder="Type something..." />
            </div>
            <div>
              <Label htmlFor="email">Email Input</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="password">Password Input</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>
        )
      case 'label':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="example">Form Label</Label>
              <Input id="example" placeholder="Associated input" />
            </div>
            <div>
              <Label className="text-sm font-medium">Standalone Label</Label>
            </div>
          </div>
        )
      case 'textarea':
        return (
          <div className="space-y-6 max-w-md">
            <div>
              <h3 className="text-lg font-semibold mb-3">Textarea Examples</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="check1" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked === true)} />
              <Label htmlFor="check1">Accept terms and conditions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check2" />
              <Label htmlFor="check2">Subscribe to newsletter</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Status: {isChecked ? "Checked" : "Unchecked"}
            </p>
          </div>
        )
      case 'switch':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="switch1" checked={isSwitchOn} onCheckedChange={setIsSwitchOn} />
              <Label htmlFor="switch1">Enable notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="switch2" />
              <Label htmlFor="switch2">Dark mode</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Status: {isSwitchOn ? "On" : "Off"}
            </p>
          </div>
        )
      case 'radio-group':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Radio Group Examples</h3>
              <div className="space-y-4">
                <div>
                  <Label>Choose your plan</Label>
                  <RadioGroup defaultValue="comfortable" className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="r1" />
                      <Label htmlFor="r1">Default</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comfortable" id="r2" />
                      <Label htmlFor="r2">Comfortable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compact" id="r3" />
                      <Label htmlFor="r3">Compact</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        )
      case 'slider':
        return (
          <div className="space-y-6 max-w-md">
            <div>
              <h3 className="text-lg font-semibold mb-3">Slider Examples</h3>
              <div className="space-y-6">
                <div>
                  <Label>Volume</Label>
                  <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
                </div>
                <div>
                  <Label>Range</Label>
                  <Slider defaultValue={[25, 75]} max={100} step={1} className="mt-2" />
                </div>
                <div>
                  <Label>Price Range</Label>
                  <Slider defaultValue={[100]} max={1000} step={10} className="mt-2" />
                </div>
              </div>
            </div>
          </div>
        )
      case 'separator':
        return (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">Content above separator</p>
              <Separator />
              <p className="text-muted-foreground mt-4">Content below separator</p>
            </div>
            <div className="flex items-center space-x-4 h-20">
              <div className="text-muted-foreground">Left content</div>
              <Separator orientation="vertical" />
              <div className="text-muted-foreground">Right content</div>
            </div>
          </div>
        )
      case 'badge':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Usage Examples</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge>New</Badge>
                <Badge variant="secondary">Beta</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </div>
          </div>
        )
      case 'progress':
        return (
          <div className="space-y-6 max-w-md">
            <div>
              <h3 className="text-lg font-semibold mb-3">Progress Examples</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Loading...</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading...</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Complete</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div>Component preview not available</div>
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Basic Components</h1>
        <p className="text-muted-foreground">
          Essential form controls and basic UI elements
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {basicComponents.map((component) => (
              <button
                key={component.id}
                onClick={() => setActiveComponent(component.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeComponent === component.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium">{component.name}</div>
                <div className="text-sm text-muted-foreground">
                  {component.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {basicComponents.find(c => c.id === activeComponent)?.name}
              </CardTitle>
              <CardDescription>
                {basicComponents.find(c => c.id === activeComponent)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getComponentPreview(activeComponent)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}