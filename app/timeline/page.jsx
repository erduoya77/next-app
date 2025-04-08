import { getAllPosts } from '@/lib/api'
import Timeline from '@/app/components/Timeline'

export default async function TimelinePage() {
  const posts = await getAllPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">时间轴</h1>
      <Timeline posts={posts} />
    </div>
  )
} 