import { getTimeline } from '@/lib/api'
import Timeline from '@/app/components/Timeline'

export const revalidate = 3600 // 每小时重新验证

export default async function TimelinePage() {
  const timelineData = await getTimeline()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">时间轴</h1>
      <Timeline timelineData={timelineData} />
    </div>
  )
} 