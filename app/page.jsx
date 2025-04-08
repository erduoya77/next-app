import { getAllPosts } from '@/lib/api'
import PostGrid from './components/PostGrid'

export default async function Home() {
  
  const posts = await getAllPosts()
  

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