'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  imageOpacity: number
  setImageOpacity: (v: number) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [imageOpacity, setImageOpacity] = useState<number>(0.18)

  // Load persisted settings
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const t = window.localStorage.getItem('mm_theme')
      const o = window.localStorage.getItem('mm_image_opacity')
      if (t === 'light' || t === 'dark') setTheme(t)
      if (o) {
        const v = parseFloat(o)
        if (!Number.isNaN(v)) setImageOpacity(Math.min(1, Math.max(0, v)))
      }
    } catch {}
  }, [])

  // Apply CSS vars and class on body
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('theme-dark', theme === 'dark')
    document.documentElement.classList.toggle('theme-light', theme === 'light')
    document.documentElement.style.setProperty('--mm-image-opacity', String(imageOpacity))
    try {
      window.localStorage.setItem('mm_theme', theme)
      window.localStorage.setItem('mm_image_opacity', String(imageOpacity))
    } catch {}
  }, [theme, imageOpacity])

  const value = useMemo(() => ({ theme, setTheme, imageOpacity, setImageOpacity }), [theme, imageOpacity])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
