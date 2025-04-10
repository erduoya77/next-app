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
        // 生成更可靠的ID
        const cleanId = heading.textContent
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-|-$/g, '')
          .replace(/--+/g, '-')
        
        // 设置标题的ID
        heading.id = cleanId // 直接设置id属性
        
        return {
          id: cleanId,
          text: heading.textContent,
          level: parseInt(heading.tagName[1])
        }
      })
      setHeadings(headingsData)
    }, 1000) // 增加延迟时间到1000ms

    return () => clearTimeout(timer)
  }, [post])

  // 添加复制代码功能
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // 复制成功
    }).catch(err => {
      console.error('复制失败:', err)
    })
  }

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
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, children, ...props }) => {
                const id = children.toString()
                  .toLowerCase()
                  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                  .replace(/^-|-$/g, '')
                  .replace(/--+/g, '-')
                return <h1 id={id} className="text-5xl font-bold mb-6" {...props}>{children}</h1>
              },
              h2: ({ node, children, ...props }) => {
                const id = children.toString()
                  .toLowerCase()
                  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                  .replace(/^-|-$/g, '')
                  .replace(/--+/g, '-')
                return <h2 id={id} className="text-4xl font-semibold mb-5" {...props}>{children}</h2>
              },
              h3: ({ node, children, ...props }) => {
                const id = children.toString()
                  .toLowerCase()
                  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
                  .replace(/^-|-$/g, '')
                  .replace(/--+/g, '-')
                return <h3 id={id} className="text-3xl font-medium mb-4" {...props}>{children}</h3>
              },
              img: CustomImage,
              p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
              a: ({ node, href, children, ...props }) => (
                <a 
                  href={href} 
                  className="text-blue-600 dark:text-blue-400 hover:underline" 
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  {...props}
                >
                  {children}
                </a>
              ),
              ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-4" {...props} />,
              ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-4" {...props} />,
              li: ({ node, ...props }) => <li className="my-1" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-4 italic" {...props} />
              ),
              hr: ({ node, ...props }) => <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />,
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="px-6 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" {...props} />
              ),
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
                  <div className="relative my-6">
                    <button
                      onClick={() => copyToClipboard(codeContent)}
                      className="absolute right-2 top-2 px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      复制代码
                    </button>
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
        <div className="fixed top-24 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hidden xl:block">
          <nav className="space-y-2">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const target = document.getElementById(heading.id)
                  if (target) {
                    target.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })
                  } else {
                    // 目标元素未找到，无需额外处理
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