"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcss-ui/card"
import { AspectRatio } from "@/components/shadcss-ui/aspect-ratio"
import { ScrollArea } from "@/components/shadcss-ui/scroll-area"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/shadcss-ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcss-ui/tabs"
import { Skeleton } from "@/components/shadcss-ui/skeleton"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader
} from "@/components/shadcss-ui/sidebar"

const layoutComponents = [
  { id: 'aspect-ratio', name: 'Aspect Ratio', description: 'Maintain aspect ratio' },
  { id: 'scroll-area', name: 'Scroll Area', description: 'Custom scrollable area' },
  { id: 'resizable', name: 'Resizable', description: 'Resizable panel layouts' },
  { id: 'tabs', name: 'Tabs', description: 'Tabbed content interface' },
  { id: 'skeleton', name: 'Skeleton', description: 'Loading placeholders' },
  { id: 'sidebar', name: 'Sidebar', description: 'Application sidebar navigation' },
]

export default function LayoutComponentsPage() {
  const [activeComponent, setActiveComponent] = useState('aspect-ratio')

  const getComponentPreview = (componentId: string) => {
    switch (componentId) {
      case 'aspect-ratio':
        return (
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-semibold mb-3">16:9 Ratio</h3>
              <AspectRatio ratio={16 / 9}>
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                  16:9 Content
                </div>
              </AspectRatio>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">1:1 Ratio</h3>
              <AspectRatio ratio={1}>
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                  1:1 Content
                </div>
              </AspectRatio>
            </div>
          </div>
        )
      case 'scroll-area':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Scrollable Content</h3>
              <ScrollArea className="h-72 w-48 rounded-md border p-4">
                <div className="space-y-4">
                  {Array.from({ length: 50 }, (_, i) => (
                    <div key={i} className="text-sm">
                      Item {i + 1}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )
      case 'resizable':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Resizable Panels</h3>
              <ResizablePanelGroup direction="horizontal" className="max-w-md rounded-lg border">
                <ResizablePanel defaultSize={50}>
                  <div className="flex h-[200px] items-center justify-center p-6">
                    <span className="font-semibold">Panel One</span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={25}>
                      <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">Panel Two</span>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={75}>
                      <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">Panel Three</span>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        )
      case 'tabs':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Tab Examples</h3>
              <Tabs defaultValue="account" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Account Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your account details and preferences.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="password" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Password Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Change your password and security settings.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">General Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure your application preferences.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )
      case 'skeleton':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Loading Skeletons</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>
        )
      case 'sidebar':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Sidebar Example</h3>
              <div className="border rounded-lg overflow-hidden">
                <SidebarProvider>
                  <div className="flex h-[400px]">
                    <Sidebar>
                      <SidebarHeader>
                        <h2 className="text-lg font-semibold px-4 py-2">Navigation</h2>
                      </SidebarHeader>
                      <SidebarContent>
                        <SidebarGroup>
                          <SidebarGroupLabel>Application</SidebarGroupLabel>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              <SidebarMenuItem>
                                <SidebarMenuButton>
                                  Dashboard
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                <SidebarMenuButton>
                                  Projects
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                              <SidebarMenuItem>
                                <SidebarMenuButton>
                                  Settings
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </SidebarGroup>
                      </SidebarContent>
                    </Sidebar>
                    <SidebarInset>
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <SidebarTrigger />
                          <p className="mt-4 text-muted-foreground">Main content area</p>
                        </div>
                      </div>
                    </SidebarInset>
                  </div>
                </SidebarProvider>
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
        <h1 className="text-3xl font-bold mb-2">Layout Components</h1>
        <p className="text-muted-foreground">
          Components for structuring and organizing content
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {layoutComponents.map((component) => (
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
                {layoutComponents.find(c => c.id === activeComponent)?.name}
              </CardTitle>
              <CardDescription>
                {layoutComponents.find(c => c.id === activeComponent)?.description}
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