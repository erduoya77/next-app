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

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      <button
        onClick={toggleTheme}
        className="rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700 dark:hover:bg-gray-700"
        aria-label="切换主题"
      >
        {resolvedTheme === 'dark' ? (
          <SunIcon className="h-6 w-6 text-yellow-500" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="rounded-full bg-white p-2 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800 dark:border dark:border-gray-700 dark:hover:bg-gray-700"
          aria-label="返回顶部"
        >
          <ArrowUpIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      )}
    </div>
  )
} 