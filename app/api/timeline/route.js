import { NextResponse } from 'next/server'
import { getTimeline } from '@/lib/api'

export async function GET() {
  try {
    const timeline = await getTimeline()
    return NextResponse.json(timeline)
  } catch (error) {
    console.error('获取时间轴数据失败:', error)
    return NextResponse.json({ error: '获取时间轴数据失败' }, { status: 500 })
  }
} 