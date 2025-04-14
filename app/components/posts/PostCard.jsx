'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

function PostCard({ post }) {
  const router = useRouter()
  const { title, date, tags, backImg, category, slug, type = 'post' } = post

  const handleTagClick = (e, tag) => {
    e.preventDefault()
    e.stopPropagation()
    const encodedTag = encodeURIComponent(tag).replace(/%/g, '%25')
    router.push(`/search?tag=${encodedTag}`)
  }

  const handleCategoryClick = (e, category) => {
    e.preventDefault()
    e.stopPropagation()
    const encodedCategory = encodeURIComponent(category).replace(/%/g, '%25')
    router.push(`/search?category=${encodedCategory}`)
  }

  // 使用 useMemo 优化标签解析
  const parsedTags = useMemo(() => {
    if (!tags) return []
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') {
      return tags.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean)
    }
    return []
  }, [tags])

  // 根据类型生成链接
  const getLink = () => {
    if (type === 'page') {
      return `/${slug}` // 页面直接使用 slug 作为路径
    }
    return `/posts/${slug}` // 文章使用 /posts/slug 路径
  }

  return (
    <div className={`block bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700/50 dark:border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
      type === 'page' ? 'border-l-4 border-blue-500' : ''
    }`}>
      <Link href={getLink()} className="block">
        {backImg && (
          <div className="relative w-full">
            <Image
              src={backImg}
              alt={title}
              width={800}
              height={600}
              className="w-full h-auto pointer-events-none dark:brightness-90"
              priority
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold line-clamp-2 text-gray-900 dark:text-gray-100">{title}</h2>
            {type === 'page' && (
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                页面
              </span>
            )}
          </div>
          
          {type === 'post' && (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {parsedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={(e) => handleTagClick(e, tag)}
                    className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {category && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  分类：{category}
                </div>
              )}
            </>
          )}

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(date).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </Link>
    </div>
  )
}

// 使用 memo 优化组件，避免不必要的重渲染
export default memo(PostCard) 