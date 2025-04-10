import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { config } from '@/config/config'

// 获取内容根目录的绝对路径
const CONTENT_PATH = path.join(process.cwd(), config.site.contentPath)

// 解析 markdown 文件
async function parseMarkdownFile(filePath) {
  try {
    
    
    
    const fullPath = path.join(CONTENT_PATH, filePath)
    const fileContent = await fs.readFile(fullPath, 'utf-8')
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
        const stats = await fs.stat(fullPath)
        frontmatter.date = stats.mtime.toISOString().split('T')[0]
      } catch (err) {
        frontmatter.date = new Date().toISOString().split('T')[0]
      }
    }
    
    // 确保tags是数组
    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      frontmatter.tags = [frontmatter.tags]
    }
    
    console.log(`解析文件元数据:`, {
      slug: frontmatter.slug,
      type: frontmatter.type,
      title: frontmatter.title
    })
    
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
async function getAllMarkdownFiles(dirPath) {
  try {
    
    
    
    const fullPath = path.join(CONTENT_PATH, dirPath)
    const files = await fs.readdir(fullPath)
    const markdownFiles = []

    for (const file of files) {
      const fullFilePath = path.join(fullPath, file)
      const stat = await fs.stat(fullFilePath)

      if (stat.isDirectory()) {
        // 递归处理子目录
        const subDirFiles = await getAllMarkdownFiles(path.join(dirPath, file))
        markdownFiles.push(...subDirFiles)
      } else if (file.endsWith('.md')) {
        // 处理所有 .md 文件
        markdownFiles.push(path.join(dirPath, file))
      }
    }

    
    return markdownFiles
  } catch (error) {
    console.error(`Error getting markdown files from ${dirPath}:`, error)
    return []
  }
}

// 获取文章内容
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')
    
    
    
    if (!filePath) {
      console.error('缺少文件路径参数')
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    const post = await parseMarkdownFile(filePath)
    
    if (!post) {
      console.error('文章未找到:', filePath)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error in markdown API:', error)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}

// 获取所有文章
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url)
    const dirPath = searchParams.get('dir') || 'posts'
    
    
    
    const files = await getAllMarkdownFiles(dirPath)
    
    
    // 减少并发请求数，避免可能的问题
    const posts = []
    for (const file of files) {
      const post = await parseMarkdownFile(file)
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