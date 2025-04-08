'use client'

import { useEffect, useState } from 'react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { useRouter } from 'next/navigation'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
// ... 其他语言导入保持不变

// 注册语言保持不变
SyntaxHighlighter.registerLanguage('bash', bash)
// ... 其他语言注册保持不变

export default function PostDetail({ post }) {
  const [headings, setHeadings] = useState([])
  const router = useRouter()

  useEffect(() => {
    // 延迟执行，确保 ReactMarkdown 渲染完成
    const timer = setTimeout(() => {
      const articleHeadings = document.querySelectorAll('.prose h1, .prose h2, .prose h3')
      const headingsData = Array.from(articleHeadings).map(heading => {
        let cleanId = heading.id
        if (!cleanId || !/^[a-zA-Z]/.test(cleanId)) {
          cleanId = `heading-${cleanId || heading.textContent
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
            .replace(/^-|-$/g, '')}`
          // 直接设置 DOM 元素的 id
          heading.setAttribute('id', cleanId)
        }
        return {
          id: cleanId,
          text: heading.textContent,
          level: parseInt(heading.tagName[1])
        }
      })
      setHeadings(headingsData)
       // 调试生成的 headings
    }, 100) // 延迟 100ms，确保 DOM 已更新

    return () => clearTimeout(timer) // 清理定时器
  }, [post])

  const CustomImage = ({ src, alt }) => {
    let imageSrc = src
    if (!src.startsWith('http') && !src.startsWith('/')) {
      imageSrc = `/posts/${post.slug}/images/${src.replace('images/', '')}`
    }
    return <img src={imageSrc} alt={alt} className="rounded-lg" />
  }

  const { metadata, content } = post
  const { title, date, tags = [], category } = metadata

  
  return (
    <div className="relative max-w-4xl mx-auto">
      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-4">
            <time dateTime={date}>{new Date(date).toLocaleDateString('zh-CN')}</time>
            {metadata.type == 'post' && category && (
              <>
                <span>·</span>
                <button 
                  onClick={() => router.push(`/search?category=${encodeURIComponent(category)}`)} 
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  分类：{category}
                </button>
              </>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => router.push(`/search?tag=${encodeURIComponent(tag)}`)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="prose dark:prose-invert max-w-none leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]} // 移除 rehype-slug，交给 useEffect 处理 id
            components={{
              h1: ({ node, ...props }) => <h1 className="text-5xl font-bold mb-6" {...props} />,
              h2: ({ node, ...props }) => <h2 className="text-4xl font-semibold mb-5" {...props} />,
              h3: ({ node, ...props }) => <h3 className="text-3xl font-medium mb-4" {...props} />,
              img: CustomImage,
              p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
              pre({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                let lang = match ? match[1] : ''
                if (lang === 'sh' || lang === 'shell' || lang === 'bash') {
                  lang = 'bash'
                }
                const codeContent = React.Children.toArray(children)
                  .filter(child => typeof child === 'string' || (child.props && child.props.children))
                  .map(child => (typeof child === 'string' ? child : child.props.children))
                  .join('')
                return (
                  <div className="my-6">
                    <SyntaxHighlighter
                      style={oneDark}
                      language={lang || 'text'}
                      PreTag="pre"
                      customStyle={{ borderRadius: '0.375rem', margin: 0 }}
                      {...props}
                    >
                      {codeContent.replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                )
              },
              code({ node, inline, className, children, ...props }) {
                if (inline) {
                  return (
                    <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  )
                }
                return <code className={className} {...props}>{children}</code>
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>

      {headings.length > 0 && (
        <div className="fixed top-24 right-8 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hidden xl:block">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">目录</h3>
          <nav className="space-y-2">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const target = document.querySelector(`#${heading.id}`)
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' })
                  } else {
                    console.error(`Target not found: #${heading.id}`) // 调试未找到的目标
                  }
                }}
                className={`block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ${
                  heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : ''
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}