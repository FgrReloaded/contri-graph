"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Switch } from '@/components/animate-ui/components/headless/switch';

export function ThemeToggler() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const isDark = theme === "dark"
  const onChange = React.useCallback((checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }, [setTheme])

  if (!mounted) {
    return <div className="h-5 w-8 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60" />
  }

  return (
    <Switch
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      checked={isDark}
      onChange={onChange}
      pressedWidth={16}
    />
  )
}
