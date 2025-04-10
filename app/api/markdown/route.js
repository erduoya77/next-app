import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { config } from '@/config/config'

// 获取内容根目录的绝对路径
const CONTENT_PATH = path.join(process.cwd(), config.site.contentPath)

// 添加调试信息，帮助排查问题




// 检查目录是否存在
function checkDirectoryExists(dirPath) {
  try {
    fs.accessSync(dirPath)
    return true
  } catch (error) {
    console.error(`目录不存在: ${dirPath}`, error)
    return false
  }
}

// 解析 markdown 文件
function parseMarkdownFile(filePath) {
  try {
    const fullPath = path.join(CONTENT_PATH, filePath)
    
    
    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      console.error(`文件不存在: ${fullPath}`)
      return null
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf-8')
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
    
    // 确保tags是数组
    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      frontmatter.tags = [frontmatter.tags]
    }
    
    
    
    return {
      metadata: frontmatter,
      content,
      slug
    }
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error)
    return null
  }
}

// 递归获取目录下的所有 markdown 文件
function getAllMarkdownFiles(dirPath) {
  try {
    const fullPath = path.join(CONTENT_PATH, dirPath)
    
    
    // 检查目录是否存在
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
        const subDirFiles = getAllMarkdownFiles(path.join(dirPath, file))
        markdownFiles.push(...subDirFiles)
      } else if (file.endsWith('.md')) {
        // 处理所有 .md 文件
        const post = parseMarkdownFile(path.join(dirPath, file))
        if (post) {
          markdownFiles.push(post)
        }
      }
    }

    
    return markdownFiles
  } catch (error) {
    console.error(`Error getting markdown files from ${dirPath}:`, error)
    return []
  }
}

// 获取文章内容或目录内容
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    const dirPath = searchParams.get('dir')
    
    
    
    // 优先处理文件路径查询
    if (filePath) {
      
      const post = parseMarkdownFile(filePath)
      
      if (!post) {
        console.error('文章未找到:', filePath)
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      
      return NextResponse.json(post)
    } 
    // 处理目录查询
    else if (dirPath) {
      
      const files = getAllMarkdownFiles(dirPath)
      
      if (!files || files.length === 0) {
        
        return NextResponse.json([])
      }
      
      return NextResponse.json(files)
    }
    else {
      console.error('缺少参数: 需要path或dir参数')
      return NextResponse.json({ error: 'Either path or dir parameter is required' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in markdown API:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// 获取目录下的所有文章
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url)
    const dirPath = searchParams.get('dir') || 'posts'
    
    
    
    const files = getAllMarkdownFiles(dirPath)
    
    // 减少并发请求数，避免可能的问题
    const posts = []
    for (const file of files) {
      const post = parseMarkdownFile(file)
      if (post) {
        posts.push(post)
      }
    }

    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error in markdown API:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
} 