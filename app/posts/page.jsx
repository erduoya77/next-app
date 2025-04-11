import { getAllPostsFromBackend } from '@/lib/api'
import PostList from '@/app/components/PostList'

export const revalidate = 3600 // 每小时重新验证

export async function generateMetadata() {
  return {
    title: '文章列表 - 我的博客',
    description: '查看所有文章列表'
  }
}

export default async function PostsPage() {
  const posts = await getAllPostsFromBackend()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">所有文章</h1>
      <PostList posts={posts} />
    </div>
  )
} 