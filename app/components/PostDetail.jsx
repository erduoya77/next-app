'use client'

import { useEffect, useState, useRef } from 'react'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { useRouter } from 'next/navigation'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// 动态导入 ImagePreview 组件以优化客户端加载
const ImagePreview = dynamic(() => import('./ui/ImagePreview'), {
  ssr: false,
});

// 注册语言保持不变
SyntaxHighlighter.registerLanguage('bash', bash)
// ... 其他语言注册保持不变

// 统一的ID生成函数
const generateId = (text) => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/--+/g, '-')
}

export default function PostDetail({ post }) {
  const [headings, setHeadings] = useState([])
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const router = useRouter()
  const contentRef = useRef(null)
  const imageUrlsRef = useRef([]) // 用于存储所有图片URL
  const currentImageIndexRef = useRef(0) // 当前预览的图片索引
  // 获取基础URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  // 获取API基础URL
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // 延迟执行，确保 ReactMarkdown 渲染完成
    const timer = setTimeout(() => {
      if (!contentRef.current) return
      
      const articleHeadings = contentRef.current.querySelectorAll('h1, h2, h3')
      
      const headingsData = Array.from(articleHeadings).map(heading => {
        return {
          id: heading.id,
          text: heading.textContent,
          level: parseInt(heading.tagName[1])
        }
      })
      setHeadings(headingsData)

      // 收集所有图片URL
      const images = contentRef.current.querySelectorAll('img')
      imageUrlsRef.current = Array.from(images).map(img => img.src)
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

  // 处理关闭预览
  const handleClosePreview = () => {
    setShowImagePreview(false)
  }

  // 自定义图片组件
  const CustomImage = ({ src, alt }) => {
    let imageSrc = src
    if (!src.startsWith('http') && !src.startsWith('/')) {
      // 使用代理路径获取图片
      const cleanImagePath = src.replace('images/', '');
      imageSrc = `/api/images/${post.slug}/${cleanImagePath}`;
    } else if (src.startsWith('/') && !src.startsWith('//')) {
      // 处理绝对路径但不是协议相对URL的情况
      imageSrc = `${baseUrl}${src}`
    }

    // 处理图片点击
    const handleImageClick = (e) => {
      e.preventDefault()
      // 找出当前图片在图片数组中的索引
      const index = imageUrlsRef.current.findIndex(url => url === imageSrc)
      if (index !== -1) {
        currentImageIndexRef.current = index
      } else {
        // 如果找不到图片，收集所有图片并重新找索引
        // 这可能发生在动态加载的情况下
        const images = contentRef.current.querySelectorAll('img')
        imageUrlsRef.current = Array.from(images).map(img => img.src)
        // 重新找索引
        const newIndex = imageUrlsRef.current.findIndex(url => url === imageSrc)
        currentImageIndexRef.current = newIndex !== -1 ? newIndex : 0
      }
      setPreviewImageUrl(imageSrc)
      setShowImagePreview(true)
    }

    return (
      <img 
        src={imageSrc} 
        alt={alt} 
        className="rounded-lg cursor-pointer" 
        onClick={handleImageClick} 
      />
    )
  }

  if (!post) {
    return null
  }

  const { title, date, tags = [], category, content, type = 'post' } = post
  
  return (
    <div className="relative max-w-4xl mx-auto">
      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 mb-4">
            <time dateTime={date}>{new Date(date).toLocaleDateString('zh-CN')}</time>
            {type === 'post' && category && (
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

        <div ref={contentRef} className="prose dark:prose-invert max-w-none leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, children, ...props }) => {
                const id = generateId(children)
                return <h1 id={id} className="text-5xl font-bold mb-6" {...props}>{children}</h1>
              },
              h2: ({ node, children, ...props }) => {
                const id = generateId(children)
                return <h2 id={id} className="text-4xl font-semibold mb-5" {...props}>{children}</h2>
              },
              h3: ({ node, children, ...props }) => {
                const id = generateId(children)
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
        <div className="fixed top-24 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hidden xl:block max-h-[calc(100vh-10rem)] overflow-auto">
          <h4 className="text-lg font-semibold mb-3 sticky top-0 bg-white dark:bg-gray-800 py-1">目录</h4>
          <nav className="space-y-2">
            {headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const target = document.getElementById(heading.id)
                  if (target) {
                    // 使用平滑滚动
                    target.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }
                }}
                className={`block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:translate-y-[-2px] transition-all duration-200 truncate ${
                  heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : ''
                }`}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* 图片预览组件 */}
      {showImagePreview && (
        <ImagePreview
          images={imageUrlsRef.current}
          initialIndex={currentImageIndexRef.current}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}