import { NextResponse } from 'next/server'
import { getAllPosts } from '@/lib/api'

// 解析标签字符串为数组
function parseTags(tagsString) {
  if (!tagsString) return []
  
  // 如果已经是数组，处理数组中的每个元素
  if (Array.isArray(tagsString)) {
    return tagsString.flatMap(tag => 
      tag.split(',').map(t => t.trim()).filter(t => t)
    )
  }
  
  // 如果是字符串，按逗号分割
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag)
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    const tag = searchParams.get('tag')
    const category = searchParams.get('category')

    let posts = await getAllPosts()

    // 如果有分类，先按分类筛选
    if (category) {
      posts = posts.filter(post => 
        post.metadata.category?.toLowerCase() === category.toLowerCase()
      )
    }

    // 如果有标签，按标签筛选
    if (tag) {
      posts = posts.filter(post => {
        if (!post.metadata.tags) return false
        const postTags = parseTags(post.metadata.tags)
        return postTags.some(t => 
          t.toLowerCase() === tag.toLowerCase()
        )
      })
    }

    // 如果有搜索关键词，按关键词筛选
    if (query) {
      posts = posts.filter(post => {
        const title = post.metadata.title.toLowerCase()
        const content = post.content.toLowerCase()
        const postTags = parseTags(post.metadata.tags)
        const category = post.metadata.category?.toLowerCase() || ''
        
        return (
          title.includes(query) ||
          content.includes(query) ||
          category.includes(query) ||
          postTags.some(t => t.toLowerCase().includes(query))
        )
      })
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('搜索出错:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
} 