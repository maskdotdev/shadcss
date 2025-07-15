"use client"

import * as React from "react"
import { Button } from "@/components/shadcss-ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "☀️"
      case "dark":
        return "🌙"
      case "system":
        return "💻"
      default:
        return "💻"
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "system":
        return "System"
      default:
        return "System"
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="gap-2"
    >
      <span className="text-base">{getThemeIcon()}</span>
      <span className="text-sm">{getThemeLabel()}</span>
    </Button>
  )
}