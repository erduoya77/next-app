import { NextResponse } from 'next/server'
import { searchPosts } from '@/lib/api'

/**
 * 搜索API路由
 * 注意：此路由主要用于外部客户端访问或调试目的
 * 内部页面组件应直接使用 lib/api.js 中的 searchPosts() 函数
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''
    const category = searchParams.get('category') || ''
    
    const posts = await searchPosts({ query, tag, category })
    return NextResponse.json(posts)
  } catch (error) {
    console.error('搜索失败:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
} 