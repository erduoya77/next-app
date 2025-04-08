'use client'

import { useState } from 'react'

export default function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false)
  const code = typeof children === 'string' ? children : children?.props?.children || ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className={`relative !mt-0 !bg-gray-100 dark:!bg-gray-800 ${className || ''}`}>
        {children}
      </pre>
    </div>
  )
} 