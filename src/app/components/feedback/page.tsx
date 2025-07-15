"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcss-ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/shadcss-ui/alert"
import { Button } from "@/components/shadcss-ui/button"
import { toast } from "@/components/shadcss-ui/sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcss-ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/shadcss-ui/alert-dialog"

const feedbackComponents = [
  { id: 'alert', name: 'Alert', description: 'Display important messages' },
  { id: 'alert-dialog', name: 'Alert Dialog', description: 'Modal confirmation dialogs' },
  { id: 'tooltip', name: 'Tooltip', description: 'Hover information' },
  { id: 'sonner', name: 'Sonner', description: 'Toast notification system' },
]

export default function FeedbackComponentsPage() {
  const [activeComponent, setActiveComponent] = useState('alert')

  const getComponentPreview = (componentId: string) => {
    switch (componentId) {
      case 'alert':
        return (
          <div className="space-y-4 max-w-2xl">
            <Alert>
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert with some important information.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertTitle>Error Alert</AlertTitle>
              <AlertDescription>
                Something went wrong. Please check your input and try again.
              </AlertDescription>
            </Alert>
          </div>
        )
      case 'alert-dialog':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Alert Dialog Examples</h3>
              <div className="flex gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Show Dialog</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Item</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this item? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )
      case 'tooltip':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Tooltip Examples</h3>
              <TooltipProvider>
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover me</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is a tooltip</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button>Another tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Tooltip on bottom</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary">Left tooltip</Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Tooltip on left side</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        )
      case 'sonner':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Toast Examples</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => toast("Event has been created", {
                    description: "Sunday, December 03, 2023 at 9:00 AM",
                  })}
                >
                  Show Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.success("Success!", {
                    description: "Your changes have been saved.",
                  })}
                >
                  Success Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => toast.error("Error!", {
                    description: "Something went wrong. Please try again.",
                  })}
                >
                  Error Toast
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => toast.info("Info", {
                    description: "Here's some helpful information.",
                  })}
                >
                  Info Toast
                </Button>
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
        <h1 className="text-3xl font-bold mb-2">Feedback Components</h1>
        <p className="text-muted-foreground">
          Components for providing user feedback and notifications
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {feedbackComponents.map((component) => (
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
                {feedbackComponents.find(c => c.id === activeComponent)?.name}
              </CardTitle>
              <CardDescription>
                {feedbackComponents.find(c => c.id === activeComponent)?.description}
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