'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import PostList from '@/app/components/PostList'
import { searchPosts as searchPostsApi } from '@/lib/api'

// 创建一个客户端组件包装器，用于调用服务端函数
const searchPostsClient = async (params) => {
  try {
    // 在客户端模式下，调用API路由
    const queryParams = new URLSearchParams()
    if (params.query) queryParams.append('q', params.query)
    if (params.tag) queryParams.append('tag', params.tag)
    if (params.category) queryParams.append('category', params.category)
    queryParams.append('type', 'post')
    
    const response = await fetch(`/api/search?${queryParams.toString()}`)
    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('搜索出错:', error)
    return []
  }
}

// 将主要内容提取到一个单独的组件中
function SearchContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [posts, setPosts] = useState([])
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
    const fetchPosts = async () => {
      if (!searchTerm && !selectedTag && !selectedCategory) {
        setPosts([])
        setHasSearched(false)
        return
      }

      setLoading(true)
      setHasSearched(true)
      
      try {
        const data = await searchPostsClient({
          query: searchTerm,
          tag: selectedTag,
          category: selectedCategory
        })
        setPosts(data)
      } catch (error) {
        console.error('搜索出错:', error)
        setPosts([])
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
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
      <div className="container mx-auto px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              搜索文章
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
              placeholder="输入关键词搜索文章..."
              className="w-full p-4 pl-12 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl 
                       bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:border-blue-500 
                       dark:focus:border-blue-400 transition-colors text-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 dark:text-gray-500"
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

          <div className="mt-8 bg-gray-50 dark:bg-gray-900">
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
                <PostList posts={posts} simplifiedView={true} />
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
      <div className="search-page-element">
        <SearchContent />
      </div>
    </Suspense>
  )
}