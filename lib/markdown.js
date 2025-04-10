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

// 获取基础 URL
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // 客户端
    return window.location.origin
  }
  // 服务器端 - 在服务器端运行时，使用硬编码的URL
  return 'http://localhost:3000'
}

// 解析 markdown 内容
export function parseMarkdown({ content, metadata = {} }) {
  try {
    // 处理图片路径
    const processedContent = processImagePaths(content, metadata.slug)
    
    // 使用 marked 处理 Markdown 内容
    const htmlContent = marked.parse(processedContent)
    
    return {
      content: htmlContent,
      metadata
    }
  } catch (error) {
    console.error('Error parsing markdown content:', error)
    return { content, metadata }
  }
}

// 处理图片路径
function processImagePaths(content, slug) {
  // 不在这里处理图片路径，让 ReactMarkdown 的 CustomImage 组件处理
  return content
}

// 解析 markdown 文件
export async function parseMarkdownFile(filePath) {
  try {
    // 确保 filePath 是字符串类型
    if (typeof filePath !== 'string') {
      return null
    }

    // 去除路径前缀，只保留相对于content目录的路径
    let relativePath = filePath
    if (relativePath.includes('content/')) {
      relativePath = relativePath.split('content/')[1]
    }
    
    const baseUrl = getBaseUrl()
    
    // 添加调试日志
    if (typeof window !== 'undefined') {
      
    }
    
    const response = await fetch(`${baseUrl}/api/markdown?path=${encodeURIComponent(relativePath)}`)
    if (!response.ok) {
      if (typeof window !== 'undefined') {
        console.error('Error fetching markdown file:', response.status, response.statusText)
      }
      return null
    }
    const post = await response.json()
    
    // 验证元数据
    try {
      post.metadata = validatePostMetadata(post.metadata)
    } catch (error) {
      // 如果验证失败，记录错误但不中断流程
      console.error(`验证元数据失败 (${filePath}):`, error.message)
      // 确保至少有基本的元数据
      post.metadata = post.metadata || {}
      // 添加默认的type
      if (!post.metadata.type) {
        post.metadata.type = 'post'
      }
    }
    
    return post
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('Error parsing markdown file:', error)
    }
    return null
  }
}

// 递归获取目录下的所有 markdown 文件
export async function getAllMarkdownFiles(dirPath) {
  try {
    // 确保 dirPath 是字符串类型
    if (typeof dirPath !== 'string') {
      return []
    }

    // 去除路径前缀，只保留相对于content目录的路径
    let relativePath = dirPath
    if (relativePath.includes('content/')) {
      relativePath = relativePath.split('content/')[1]
    }
    
    const baseUrl = getBaseUrl()
    
    // 添加调试日志
    if (typeof window !== 'undefined') {
      
    }
    
    const response = await fetch(`${baseUrl}/api/markdown?dir=${encodeURIComponent(relativePath)}`, {
      method: 'POST'
    })
    if (!response.ok) {
      if (typeof window !== 'undefined') {
        console.error('Error fetching markdown directory:', response.status, response.statusText)
      }
      return []
    }
    return await response.json()
  } catch (error) {
    if (typeof window !== 'undefined') {
      console.error('Error getting markdown files:', error)
    }
    return []
  }
}

// 按日期排序文章
export function sortPostsByDate(posts) {
  return posts.sort((a, b) => {
    const dateA = new Date(a.metadata.date)
    const dateB = new Date(b.metadata.date)
    return dateB - dateA
  })
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