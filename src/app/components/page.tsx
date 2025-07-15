import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcss-ui/card"
import { Button } from "@/components/shadcss-ui/button"
import { Badge } from "@/components/shadcss-ui/badge"

const componentCategories = [
  {
    id: 'basic',
    name: 'Basic Components',
    description: 'Essential form controls and basic UI elements',
    href: '/components/basic',
    components: ['Button', 'Input', 'Label', 'Textarea', 'Checkbox', 'Switch', 'Radio Group', 'Slider', 'Separator', 'Badge', 'Progress'],
    color: 'bg-blue-500'
  },
  {
    id: 'layout',
    name: 'Layout Components',
    description: 'Components for structuring and organizing content',
    href: '/components/layout',
    components: ['Aspect Ratio', 'Scroll Area', 'Resizable', 'Tabs', 'Skeleton', 'Sidebar'],
    color: 'bg-green-500'
  },
  {
    id: 'feedback',
    name: 'Feedback Components',
    description: 'Components for providing user feedback and notifications',
    href: '/components/feedback',
    components: ['Alert', 'Alert Dialog', 'Tooltip', 'Sonner'],
    color: 'bg-orange-500'
  },
  {
    id: 'navigation',
    name: 'Navigation Components',
    description: 'Components for site navigation and wayfinding',
    href: '/components/navigation',
    components: ['Breadcrumb', 'Navigation Menu', 'Pagination', 'Menubar'],
    color: 'bg-purple-500'
  }
]

export default function ComponentsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Component Library</h1>
        <p className="text-xl text-muted-foreground">
          Explore our collection of reusable UI components built with CSS Modules
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {componentCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {category.components.map((component) => (
                    <Badge key={component} variant="secondary" className="text-xs">
                      {component}
                    </Badge>
                  ))}
                </div>
                <Link href={category.href}>
                  <Button className="w-full">
                    Explore {category.name}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>About This Library</CardTitle>
            <CardDescription>
              This component library showcases shadcn/ui components converted to use CSS Modules instead of Tailwind CSS classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Each component maintains the same functionality and design while using modular CSS for better maintainability and performance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}