'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

export default function Mermaid({ code }) {
  const containerRef = useRef(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Noto Serif SC',
    })

    const renderMermaid = async () => {
      try {
        if (containerRef.current) {
          // 清除之前的内容
          containerRef.current.innerHTML = ''
          
          // 生成唯一的 ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
          
          // 渲染新图表
          const { svg } = await mermaid.render(id, code)
          containerRef.current.innerHTML = svg
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded">
              图表渲染失败: ${error.message}
            </div>
          `
        }
      }
    }

    renderMermaid()
  }, [code, resolvedTheme])

  return (
    <div 
      ref={containerRef}
      className="my-8 flex justify-center overflow-x-auto"
    />
  )
} 