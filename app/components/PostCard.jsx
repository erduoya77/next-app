'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function PostCard({ post }) {
  const router = useRouter()
  const { title, date, tags, backImg, category, slug } = post.metadata

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

  const parseTags = (tags) => {
    if (!tags) return []
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') {
      return tags.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean)
    }
    return []
  }

  return (
    <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/posts/${slug}`} className="block">
        {backImg && (
          <div className="relative w-full">
            <Image
              src={backImg}
              alt={title}
              width={800}
              height={600}
              className="w-full h-auto pointer-events-none"
              priority
            />
          </div>
        )}
        
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">{title}</h2>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {parseTags(tags).map(tag => (
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

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(date).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </Link>
    </div>
  )
} 