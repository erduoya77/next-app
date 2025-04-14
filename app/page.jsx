import { getAllPostsFromBackend } from '@/lib/api'
import dynamic from 'next/dynamic'

// 使用动态导入优化加载
const PostGrid = dynamic(() => import('./components/posts/PostGrid'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  )
})

export const revalidate = 3600 // 每小时重新验证

export default async function Home() {
  const allPosts = await getAllPostsFromBackend()
  // 只显示类型为post的文章
  const posts = allPosts.filter(post => post.type === 'post')

  return (
    <main className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">最新文章</h1>
      {posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <p className="text-gray-600 dark:text-gray-400">暂无文章</p>
      )}
    </main>
  )
} 