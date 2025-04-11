import { getAllPostsFromBackend } from '@/lib/api'
import Timeline from '@/app/components/Timeline'

export const revalidate = 3600 // 每小时重新验证

export default async function TimelinePage() {
  const allPosts = await getAllPostsFromBackend()
  const posts = allPosts.filter(post => post.type === 'post')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">时间轴</h1>
      <Timeline posts={posts} />
    </div>
  )
} 