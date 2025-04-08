'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PostList from '@/app/components/PostList'

// 将主要内容提取到一个单独的组件中
function SearchContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [posts, setPosts] = useState([])
  const [tags, setTags] = useState({})
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const searchParams = useSearchParams()

  // 从 URL 参数中获取标签、分类和搜索词
  useEffect(() => {
    const tag = searchParams.get('tag')
    const category = searchParams.get('category')
    
    if (tag) {
      setSelectedTag(tag)
      setSearchTerm(tag)
      setHasSearched(true)
    } else if (category) {
      setSelectedCategory(category)
      setSearchTerm(category)
      setHasSearched(true)
    }
  }, [searchParams])

  // 搜索文章
  useEffect(() => {
    const searchPosts = async () => {
      if (!searchTerm && !selectedTag && !selectedCategory) {
        setPosts([])
        setHasSearched(false)
        return
      }

      setLoading(true)
      setHasSearched(true)
      
      try {
        const queryParams = new URLSearchParams()
        if (searchTerm) queryParams.append('q', searchTerm)
        if (selectedTag) queryParams.append('tag', selectedTag)
        if (selectedCategory) queryParams.append('category', selectedCategory)
        
        const response = await fetch(`/api/search?${queryParams.toString()}`)
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error('搜索出错:', error)
      } finally {
        setLoading(false)
      }
    }
    searchPosts()
  }, [searchTerm, selectedTag, selectedCategory])

  // 处理标签点击
  const handleTagClick = (tag) => {
    const newTag = selectedTag === tag ? '' : tag
    setSelectedTag(newTag)
    setSearchTerm(newTag)
    setSelectedCategory('') // 清除分类选择
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto pt-20 pb-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              搜索
            </h1>
          </div>

          <div className="relative mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (!e.target.value) {
                  setSelectedTag('')
                  setSelectedCategory('')
                }
              }}
              placeholder="输入关键词搜索..."
              className="w-full p-4 pl-12 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl 
                       bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:border-blue-500 
                       dark:focus:border-blue-400 transition-colors"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {Object.keys(tags).length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {Object.entries(tags).map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm transition-all
                    ${selectedTag === tag
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } border border-gray-200 dark:border-gray-700`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            {!hasSearched ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                开始输入关键词或选择标签进行搜索
              </div>
            ) : loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  找到 {posts.length} 篇相关文章
                </div>
                <PostList posts={posts} />
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                未找到相关文章
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 主页面组件，使用Suspense包裹
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载搜索数据中...</div>}>
      <SearchContent />
    </Suspense>
  )
}