import { getAllPostsFromBackend } from '@/lib/api'
import PostGrid from './components/PostGrid'

export const revalidate = 3600 // 每小时重新验证

export default async function Home() {
  const allPosts = await getAllPostsFromBackend()
  // 只显示类型为post的文章
  const posts = allPosts.filter(post => post.type === 'post')

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">最新文章</h1>
      {posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <p className="text-gray-600 dark:text-gray-400">暂无文章</p>
      )}
    </main>
  )
} 