import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { validatePostMetadata } from './api'

// 解析 markdown 文件
export async function parseMarkdownFile(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(fileContent)
    
    // 获取文件名（不含扩展名）作为 slug
    const fileName = path.basename(filePath, '.md')
    const dirName = path.basename(path.dirname(filePath))
    // 如果文件名是 index，则使用目录名作为 slug
    const slug = fileName === 'index' ? dirName : fileName
    
    // 验证和处理元数据
    const metadata = validatePostMetadata({
      ...frontmatter,
      slug
    })
    
    // 处理图片路径
    const processedContent = processImagePaths(content, slug)
    
    return {
      metadata,
      content: processedContent,
      slug
    }
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error)
    return null
  }
}

// 递归获取目录下的所有 markdown 文件
export async function getAllMarkdownFiles(dirPath) {
  try {
    const files = await fs.readdir(dirPath)
    const markdownFiles = []

    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      const stat = await fs.stat(fullPath)

      if (stat.isDirectory()) {
        // 递归处理子目录
        const subDirFiles = await getAllMarkdownFiles(fullPath)
        markdownFiles.push(...subDirFiles)
      } else if (file.endsWith('.md' )) {
        // 处理所有 .md 文件
        markdownFiles.push(fullPath)
      }
    }

    return markdownFiles
  } catch (error) {
    console.error(`Error getting markdown files from ${dirPath}:`, error)
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

// 处理图片路径
const processImagePaths = (content, slug) => {
  // 不在这里处理图片路径，让 ReactMarkdown 的 CustomImage 组件处理
  return content
} 