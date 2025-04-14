'use client'

import Link from 'next/link'

export default function Timeline({ timelineData, posts }) {
  // 兼容旧版API，如果传入的是文章数组，则进行处理
  let years = []
  let groupedPosts = {}

  if (timelineData) {
    // 使用新的API，直接使用处理好的数据
    groupedPosts = timelineData
    years = Object.keys(groupedPosts).sort((a, b) => b - a)
  } else if (posts) {
    // 兼容旧的API，按年份和月份对文章进行分组
    groupedPosts = posts.reduce((acc, post) => {
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
    years = Object.keys(groupedPosts).sort((a, b) => b - a)
  }

  if (years.length === 0) {
    return <div className="text-center text-gray-500">暂无时间轴数据</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      {years.map(year => (
        <div key={year} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{year}年</h2>
          {Object.entries(groupedPosts[year])
            .sort(([a], [b]) => b - a) // 月份降序排序
            .map(([month, monthPosts]) => (
              <div key={`${year}-${month}`} className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-600 border-l-4 border-gray-600 pl-3">
                  {month}月
                </h3>
                <div className="space-y-4 pl-6">
                  {monthPosts.map(post => {
                    // 检查post的格式，兼容两种数据格式
                    const slug = post.slug
                    const title = post.title
                    const date = post.date
                    
                    return (
                      <Link
                        key={slug}
                        href={`/posts/${slug}`}
                        className="block group hover:translate-y-[-2px] transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <time className="text-sm text-gray-500 w-32">
                            {new Date(date).toLocaleDateString('zh-CN')}
                          </time>
                          <div className="flex-1">
                            <h4 className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {title}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
} 