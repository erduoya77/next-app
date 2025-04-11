import Link from 'next/link'
import { getAllTags } from '@/lib/api'

export const revalidate = 3600 // 每小时重新验证

export default async function TagsPage() {
  const tags = await getAllTags()
  const maxCount = Object.values(tags).length > 0 ? Math.max(...Object.values(tags)) : 0
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">标签云</h1>
      <div className="flex flex-wrap gap-4">
        {Object.entries(tags).map(([tag, count]) => {
          // 计算字体大小，基于文章数量
          const fontSize = Math.max(1, Math.min(2, 1 + (count / (maxCount || 1))))
          
          return (
            <Link
              key={tag}
              href={`/search?tag=${encodeURIComponent(tag)}`}
              className="inline-block px-4 py-2 bg-white dark:bg-gray-800 rounded-full 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                       dark:hover:bg-gray-700 transition-colors border 
                       border-gray-200 dark:border-gray-700"
              style={{ fontSize: `${fontSize}rem` }}
            >
              {tag} ({count})
            </Link>
          )
        })}
      </div>
    </div>
  )
} 