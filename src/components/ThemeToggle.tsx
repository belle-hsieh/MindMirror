'use client'

import React from 'react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme, imageOpacity, setImageOpacity } = useTheme()
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="h-9 px-3 rounded-md border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 transition"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? '☀️ Light' : '🌙 Dark'}
      </button>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        Opacity
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={imageOpacity}
          onChange={(e) => setImageOpacity(parseFloat(e.target.value))}
        />
      </label>
    </div>
  )
}
