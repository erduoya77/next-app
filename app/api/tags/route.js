import { NextResponse } from 'next/server'
import { getAllTags } from '@/lib/api'

/**
 * 标签API路由
 * 注意：此路由主要用于外部客户端访问或调试目的
 * 内部页面组件应直接使用 lib/api.js 中的 getAllTags() 函数
 */
export async function GET() {
  try {
    const tags = await getAllTags()
    return NextResponse.json(tags)
  } catch (error) {
    console.error('获取标签失败:', error)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
} 