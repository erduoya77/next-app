import path from 'path'
import matter from 'gray-matter'
import { validatePostMetadata } from './validation'
import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {}
    }
    try {
      return hljs.highlightAuto(code).value
    } catch (err) {}
    return code
  },
  langPrefix: 'hljs language-',
  gfm: true,
  breaks: true,
  pedantic: false,
  smartLists: true,
  smartypants: true,
  headerIds: true,
  mangle: false
})

// 自定义渲染器，确保有序列表正确渲染
const renderer = new marked.Renderer()

// 更新marked选项，使用自定义渲染器
marked.setOptions({ renderer })

// 解析 markdown 内容
export function parseMarkdown({ content, metadata = {} }) {
  try {
    // 使用 marked 处理 Markdown 内容
    let htmlContent = marked.parse(content)
    
    return {
      content: htmlContent,
      metadata
    }
  } catch (error) {
    console.error('Error parsing markdown content:', error)
    return { content, metadata }
  }
}

// 解析 markdown 文件
export async function parseMarkdownFile(filePath) {
  try {
    // 确保 filePath 是字符串类型
    if (typeof filePath !== 'string') {
      console.error('文件路径不是字符串类型:', filePath)
      return null
    }

    // 去除路径前缀，只保留相对于content目录的路径
    let relativePath = filePath
    if (relativePath.includes('content/')) {
      relativePath = relativePath.split('content/')[1]
    }
    
    // 使用 API 获取数据
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const apiUrl = `${baseUrl}/api/markdown?path=${encodeURIComponent(relativePath)}`
    
    const response = await fetch(apiUrl)
    if (!response.ok) {
      console.error('Error fetching markdown file:', response.status, response.statusText)
      return null
    }
    
    const post = await response.json()
    
    // 验证元数据
    try {
      post.metadata = validatePostMetadata(post.metadata)
    } catch (error) {
      console.error(`验证元数据失败 (${filePath}):`, error.message)
      post.metadata = post.metadata || {}
      if (!post.metadata.type) {
        post.metadata.type = 'post'
      }
    }
    
    return post
  } catch (error) {
    console.error('Error parsing markdown file:', error)
    return null
  }
}

// 递归获取目录下的所有 markdown 文件
export async function getAllMarkdownFiles(dirPath) {
  try {
    // 确保 dirPath 是字符串类型
    if (typeof dirPath !== 'string') {
      console.error('目录路径不是字符串类型:', dirPath)
      return []
    }

    // 去除路径前缀，只保留相对于content目录的路径
    let relativePath = dirPath
    if (relativePath.includes('content/')) {
      relativePath = relativePath.split('content/')[1]
    }
    
    // 使用 API 获取数据
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const apiUrl = `${baseUrl}/api/markdown?dir=${encodeURIComponent(relativePath)}`
    
    const response = await fetch(apiUrl)
    if (!response.ok) {
      console.error('Error fetching markdown directory:', response.status, response.statusText)
      return []
    }
    
    const result = await response.json()
    
    return result
  } catch (error) {
    console.error('Error getting markdown files:', error)
    return []
  }
}

// 提取文章摘要
export function getPostExcerpt(content, maxLength = 200) {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 处理链接
    .replace(/[#*`_]/g, '') // 移除特殊字符
    .replace(/\n+/g, ' ') // 将换行替换为空格
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  // 在最后一个完整的词处截断
  const truncated = plainText.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return truncated.slice(0, lastSpace) + '...'
}

// 按日期排序文章
export function sortPostsByDate(posts) {
  return posts.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB - dateA
  })
}

// 获取所有文章
export async function getAllPosts(type = 'post') {
  try {
    // 使用 API 获取数据
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const apiUrl = `${baseUrl}/api/markdown?dir=posts`
    
    const response = await fetch(apiUrl)
    if (!response.ok) {
      console.error('Error fetching posts:', response.status, response.statusText)
      return []
    }
    
    const posts = await response.json()
    
    return sortPostsByDate(posts.filter(post => post.metadata?.type === type))
  } catch (error) {
    console.error('获取文章失败:', error)
    return []
  }
} 