import { config } from '@/config/config'
import fs from 'fs/promises'
import path from 'path'
import { parseMarkdownFile, getAllMarkdownFiles, sortPostsByDate, getPostExcerpt } from './markdown'
import { log } from 'console'

// 获取内容根目录的绝对路径
const CONTENT_PATH = path.join(process.cwd(), config.site.contentPath)

// 递归获取所有目录配置
function getAllDirectoryConfigs(directories = config.directories) {
  let allDirs = []
  for (const dir of directories) {
    if (dir.type === 'directory') {
      allDirs.push(dir)
      if (dir.children) {
        allDirs = allDirs.concat(getAllDirectoryConfigs(dir.children))
      }
    }
  }
  return allDirs
}

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

// 获取所有文章
export async function getAllPosts(type='post') {
  try {
    const posts = []
    const postsDir = path.join(CONTENT_PATH, 'posts')
    
    
    const files = await getAllMarkdownFiles(postsDir)
    
    
    for (const file of files) {
      
      const post = await parseMarkdownFile(file)
      if (post && post.metadata.type == type) {
        // 添加文章摘要
        post.excerpt = getPostExcerpt(post.content)
        posts.push(post)
      }
    }
    
    const sortedPosts = sortPostsByDate(posts)
    
    return sortedPosts
  } catch (error) {
    console.error('获取文章失败:', error)
    return []
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
    console.error('Error getting directories:', error)
    return []
  }
}

// 获取所有标签及其文章数量
export async function getAllTags() {
  try {
    const posts = await getAllPosts()
    const tagCount = {}

    posts.forEach(post => {
      if (!post.metadata.tags) return
      
      // 解析文章的标签
      const tags = parseTags(post.metadata.tags)
      
      // 统计每个标签的出现次数
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

// 获取指定目录下的所有文章
export async function getPostsByDirectory(directory) {
  try {
    const dirPath = path.join(CONTENT_PATH, directory)
    const files = await getAllMarkdownFiles(dirPath)
    
    const posts = []
    for (const file of files) {
      const post = await parseMarkdownFile(file)
      if (post) {
        // 添加文章摘要
        post.excerpt = getPostExcerpt(post.content)
        posts.push(post)
      }
    }

    // 获取目录配置
    const dirConfig = findDirectoryConfig(directory)
    if (dirConfig?.attributes?.sortBy === 'category') {
      return sortPostsByCategory(posts)
    }
    
    return sortPostsByDate(posts)
  } catch (error) {
    console.error(`Error getting posts from directory ${directory}:`, error)
    return []
  }
}

// 获取指定标签的所有文章
export async function getPostsByTag(tag) {
  try {
    const posts = []
    const directories = getAllDirectoryConfigs()
    
    // 遍历所有目录查找包含指定标签的文章
    for (const dir of directories) {
      const dirPath = path.join(CONTENT_PATH, dir.path)
      const files = await getAllMarkdownFiles(dirPath)
      
      for (const file of files) {
        const post = await parseMarkdownFile(file)
        if (post && post.metadata.tags && post.metadata.tags.includes(tag)) {
          // 添加文章摘要
          post.excerpt = getPostExcerpt(post.content)
          posts.push(post)
        }
      }
    }
    
    return sortPostsByDate(posts)
  } catch (error) {
    console.error(`Error getting posts by tag ${tag}:`, error)
    return []
  }
}

// 根据 slug 获取单篇文章
export async function getPost(slug,type='post') {
  try {
 
    const posts = await getAllPosts(type)
    // 打印所有可用的 slugs 用于调试
    const availableSlugs = posts.map(p => p.metadata.slug)
    // 查找匹配的文章
    const post = posts.find(post => {
      const postSlug = post.metadata.slug
      
      return postSlug === slug
    })
    
    if (post) {
      return post
    } 
    return null
  } catch (error) {
    console.error('Error in getPost:', error)
    return null
  }
}

// 验证文章元数据
export function validatePostMetadata(metadata) {
  const { required, optional, defaults } = config.metadata
  
  // 检查必需字段
  const missingFields = required.filter(field => !metadata[field])
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
  
  // 应用默认值
  const validatedMetadata = {
    ...defaults,
    ...metadata,
    // 确保 tags 是数组
    tags: Array.isArray(metadata.tags) ? metadata.tags : (metadata.tags ? [metadata.tags] : []),
    // 确保日期是有效的
    date: new Date(metadata.date).toISOString().split('T')[0]
  }

  return validatedMetadata
}

// 查找目录配置
function findDirectoryConfig(dirPath, directories = config.directories) {
  for (const dir of directories) {
    if (dir.path === dirPath) {
      return dir
    }
    if (dir.children) {
      const found = findDirectoryConfig(dirPath, dir.children)
      if (found) return found
    }
  }
  return null
}

// 按分类排序文章
function sortPostsByCategory(posts) {
  return posts.sort((a, b) => {
    if (a.metadata.category === b.metadata.category) {
      return new Date(b.metadata.date) - new Date(a.metadata.date)
    }
    return a.metadata.category.localeCompare(b.metadata.category)
  })
} 