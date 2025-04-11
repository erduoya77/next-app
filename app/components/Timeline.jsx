'use client'

import Link from 'next/link'

export default function Timeline({ posts }) {
  // 按年份和月份对文章进行分组
  const groupedPosts = posts.reduce((acc, post) => {
    const date = new Date(post.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    if (!acc[year]) {
      acc[year] = {}
    }
    if (!acc[year][month]) {
      acc[year][month] = []
    }
    acc[year][month].push(post)
    return acc
  }, {})

  // 获取所有年份并降序排序
  const years = Object.keys(groupedPosts).sort((a, b) => b - a)

  return (
    <div className="max-w-3xl mx-auto">
      {years.map(year => (
        <div key={year} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{year}年</h2>
          {Object.entries(groupedPosts[year])
            .sort(([a], [b]) => b - a) // 月份降序排序
            .map(([month, monthPosts]) => (
              <div key={`${year}-${month}`} className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-blue-600 border-l-4 border-blue-600 pl-3">
                  {month}月
                </h3>
                <div className="space-y-4 pl-6">
                  {monthPosts.map(post => (
                    <Link
                      key={post.slug}
                      href={`/posts/${post.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-4">
                        <time className="text-sm text-gray-500 w-32">
                          {new Date(post.date).toLocaleDateString('zh-CN')}
                        </time>
                        <div className="flex-1">
                          <h4 className="text-lg group-hover:text-blue-600 transition-colors duration-200">
                            {post.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
} 