import path from 'path'
import matter from 'gray-matter'
import { validatePostMetadata } from './validation'
import { marked } from 'marked'
import hljs from 'highlight.js'

// 动态导入 fs，确保只在服务器端使用
let fs
if (typeof window === 'undefined') {
  fs = require('fs')
}

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
    
    // 在构建时直接读取文件
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      const fullPath = path.join(process.cwd(), 'content', relativePath)
      if (!fs.existsSync(fullPath)) {
        console.error(`文件不存在: ${fullPath}`)
        return null
      }
      
      const fileContent = fs.readFileSync(fullPath, 'utf8')
      const { data: frontmatter, content } = matter(fileContent)
      
      // 获取文件名（不含扩展名）作为 slug
      const fileName = path.basename(filePath, '.md')
      const dirName = path.basename(path.dirname(filePath))
      // 如果文件名是 index，则使用目录名作为 slug
      const slug = fileName === 'index' ? dirName : fileName
      
      // 如果元数据中没有slug，就添加一个
      if (!frontmatter.slug) {
        frontmatter.slug = slug
      }
      
      // 确保有type字段，默认为'post'
      if (!frontmatter.type) {
        frontmatter.type = 'post'
      }
      
      // 确保有date字段，如果没有就用文件修改时间
      if (!frontmatter.date) {
        try {
          const stats = fs.statSync(fullPath)
          frontmatter.date = stats.mtime.toISOString().split('T')[0]
        } catch (err) {
          frontmatter.date = new Date().toISOString().split('T')[0]
        }
      }
      
      return {
        metadata: frontmatter,
        content,
        slug
      }
    }
    
    // 在开发环境或客户端使用 API
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
    
    // 在构建时直接读取文件系统
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      const fullPath = path.join(process.cwd(), 'content', relativePath)
      if (!fs.existsSync(fullPath)) {
        console.error(`目录不存在: ${fullPath}`)
        return []
      }
      
      const files = fs.readdirSync(fullPath)
      const markdownFiles = []
      
      for (const file of files) {
        const fullFilePath = path.join(fullPath, file)
        const stat = fs.statSync(fullFilePath)
        
        if (stat.isDirectory()) {
          // 递归处理子目录
          const subDirFiles = await getAllMarkdownFiles(path.join(relativePath, file))
          markdownFiles.push(...subDirFiles)
        } else if (file.endsWith('.md')) {
          // 处理所有 .md 文件
          const post = await parseMarkdownFile(path.join(relativePath, file))
          if (post) {
            markdownFiles.push(post)
          }
        }
      }
      
      return markdownFiles
    }
    
    // 在开发环境或客户端使用 API
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

// 获取所有文章
export async function getAllPosts(type = 'post') {
  try {
    
    
    // 在构建时直接读取文件系统
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
      const postsDirectory = path.join(process.cwd(), 'content', 'posts')
      if (!fs.existsSync(postsDirectory)) {
        console.error(`目录不存在: ${postsDirectory}`)
        return []
      }
      
      const dirs = fs.readdirSync(postsDirectory)
      const posts = []
      
      for (const dir of dirs) {
        const fullDirPath = path.join(postsDirectory, dir)
        const stat = fs.statSync(fullDirPath)
        
        if (stat.isDirectory() && !dir.startsWith('.')) {
          const indexPath = path.join(fullDirPath, 'index.md')
          if (fs.existsSync(indexPath)) {
            const post = await parseMarkdownFile(path.join('posts', dir, 'index.md'))
            if (post && post.metadata.type === type) {
              posts.push(post)
            }
          }
        }
      }
      
      return sortPostsByDate(posts)
    }
    
    // 在开发环境或客户端使用 API
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