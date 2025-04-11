import { NextResponse } from 'next/server'
import { getAllTags } from '@/lib/api'

export async function GET() {
  try {
    const tags = await getAllTags()
    return NextResponse.json(tags)
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
} 