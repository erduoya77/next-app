'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

export default function Toolbar() {
  const [mounted, setMounted] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className="rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800"
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <SunIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        )}
      </button>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800"
          aria-label="Back to top"
        >
          <ArrowUpIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
        </button>
      )}
    </div>
  )
} 