import { NextResponse } from 'next/server'
import { searchPosts } from '@/lib/api'

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