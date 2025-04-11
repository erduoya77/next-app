import { NextResponse } from 'next/server'
import { getTimeline } from '@/lib/api'

/**
 * 时间轴API路由
 * 注意：此路由主要用于外部客户端访问或调试目的
 * 内部页面组件应直接使用 lib/api.js 中的 getTimeline() 函数
 */
export async function GET() {
  try {
    const timeline = await getTimeline()
    return NextResponse.json(timeline)
  } catch (error) {
    console.error('获取时间轴数据失败:', error)
    return NextResponse.json({ error: '获取时间轴数据失败' }, { status: 500 })
  }
} 