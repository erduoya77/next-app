import { config } from '@/config/config'
import { parseMarkdown, getPostExcerpt, sortPostsByDate } from './markdown'
import { validatePostMetadata } from './validation'

// 解析标签字符串为数组
function parseTags(tagsString) {
  if (!tagsString) return []
  if (Array.isArray(tagsString)) return tagsString
  return tagsString.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean)
}

// 获取API基础URL，默认为本地开发地址
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 从后端服务获取所有文章
export async function getAllPostsFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`)
    if (!response.ok) {
      throw new Error('获取文章列表失败')
    }
    const posts = await response.json()
    return posts
  } catch (error) {
    console.error('从后端获取文章失败:', error)
    return []
  }
}

// 从后端服务获取特定文章
export async function getPostFromBackend(slug) {
  try {
    // 添加请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
    
    const response = await fetch(`${API_BASE_URL}/posts/${slug}`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache'
      }
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      console.error(`获取文章失败: HTTP ${response.status}`);
      return null;
    }
    
    const post = await response.json();
    return post;
  } catch (error) {
    // 区分不同类型的错误
    if (error.name === 'AbortError') {
      console.error('获取文章请求超时:', slug);
    } else if (error.message.includes('fetch')) {
      console.error('网络请求失败:', error.message);
    } else {
      console.error('从后端获取文章失败:', error);
    }
    return null;
  }
}

// 搜索文章
export async function searchPosts({ query = '', tag = '', category = '' }) {
  try {
    const allPosts = await getAllPostsFromBackend()
    let posts = allPosts.filter(post => post.type === 'post')

    // 如果有分类，按分类筛选
    if (category) {
      posts = posts.filter(post => 
        post.category?.toLowerCase() === category.toLowerCase()
      )
    }

    // 如果有标签，按标签筛选
    if (tag) {
      posts = posts.filter(post => {
        const postTags = parseTags(post.tags)
        return postTags.some(t => 
          t.toLowerCase() === tag.toLowerCase()
        )
      })
    }

    // 如果有搜索关键词，按关键词筛选
    if (query) {
      const searchQuery = query.toLowerCase()
      posts = posts.filter(post => {
        const title = post.title?.toLowerCase() || ''
        const content = post.content?.toLowerCase() || ''
        const postTags = parseTags(post.tags)
        const category = post.category?.toLowerCase() || ''
        
        return (
          title.includes(searchQuery) ||
          content.includes(searchQuery) ||
          category.includes(searchQuery) ||
          postTags.some(t => t.toLowerCase().includes(searchQuery))
        )
      })
    }

    return posts
  } catch (error) {
    console.error('搜索文章失败:', error)
    return []
  }
}

// 获取时间轴数据
export async function getTimeline() {
  try {
    const posts = await getAllPostsFromBackend()
    
    // 按年份和月份组织文章
    const timeline = posts
      .filter(post => post.type === 'post')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .reduce((acc, post) => {
        const date = new Date(post.date)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        
        if (!acc[year]) {
          acc[year] = {}
        }
        if (!acc[year][month]) {
          acc[year][month] = []
        }
        
        acc[year][month].push({
          title: post.title,
          slug: post.slug,
          date: post.date
        })
        
        return acc
      }, {})
    
    return timeline
  } catch (error) {
    console.error('获取时间轴数据失败:', error)
    return {}
  }
}

// 获取所有标签及其文章数量
export async function getAllTags() {
  try {
    const posts = await getAllPostsFromBackend()
    const tagCount = {}

    // 只统计文章类型的标签
    posts.filter(post => post.type === 'post').forEach(post => {
      const tags = parseTags(post.tags)
      tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    })

    return tagCount
  } catch (error) {
    console.error('获取标签统计失败:', error)
    return {}
  }
}

// 获取所有目录
export async function getDirectories() {
  try {
    return config.directories.map(dir => ({
      name: dir.name,
      path: dir.path,
      type: dir.type,
      icon: dir.icon,
      description: dir.description,
      attributes: dir.attributes,
      children: dir.children
    }))
  } catch (error) {
    console.error('获取目录失败:', error)
    return []
  }
} 