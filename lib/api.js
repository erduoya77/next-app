import { config } from '@/config/config'
import { parseMarkdownFile, getAllMarkdownFiles, sortPostsByDate, getPostExcerpt } from './markdown'
import { validatePostMetadata } from './validation'

// 解析标签字符串为数组
function parseTags(tagsString) {
  if (!tagsString) return []
  if (Array.isArray(tagsString)) return tagsString
  return tagsString.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean)
}

// 获取API基础URL，默认为本地开发地址
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// 获取所有文章
export async function getAllPosts(type='post') {
  try {
    
    const posts = []
    const postsDir = 'posts'
    
    
    const response = await getAllMarkdownFiles(postsDir)
    
    
    // 检查响应的类型
    if (Array.isArray(response)) {
      
      
      // 如果是数组，检查第一个元素的类型
      if (response.length > 0) {
        const firstItem = response[0]
        
        
        // 如果是对象并且有metadata字段，说明是文章对象
        if (typeof firstItem === 'object' && firstItem !== null && firstItem.metadata) {
          
          
          // 直接处理文章对象
          for (const post of response) {
            if (!post) continue
            
            // 添加默认type如果缺少
            if (!post.metadata.type) {
              post.metadata.type = 'post'
            }
            
            // 只包含特定类型的文章
            if (type === 'all' || post.metadata.type === type) {
              // 添加文章摘要
              post.excerpt = getPostExcerpt(post.content)
              posts.push(post)
              
            }
          }
        } else {
          
          // 如果是文件路径，使用原来的处理逻辑
          for (const file of response) {
            
            const post = await parseMarkdownFile(file)
            
            if (!post) {
              
              continue
            }
            
            // 记录元数据信息
            console.log(`文件元数据:`, {
              file,
              type: post.metadata.type,
              title: post.metadata.title,
              slug: post.metadata.slug
            })
            
            // 添加默认type如果缺少
            if (!post.metadata.type) {
              post.metadata.type = 'post'
            }
            
            // 只包含特定类型的文章
            if (type === 'all' || post.metadata.type === type) {
              // 添加文章摘要
              post.excerpt = getPostExcerpt(post.content)
              posts.push(post)
              
            }
          }
        }
      } else {
        
      }
    } else {
      console.error('API返回的数据格式不正确:', response)
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
    console.error('获取目录失败:', error)
    return []
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

// 获取指定目录下的所有文章
export async function getPostsByDirectory(directory) {
  try {
    const allPosts = await getAllPostsFromBackend()
    const posts = allPosts.filter(post => post.directory === directory)

    // 获取目录配置
    const dirConfig = findDirectoryConfig(directory)
    if (dirConfig?.attributes?.sortBy === 'category') {
      return sortPostsByCategory(posts)
    }
    
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (error) {
    console.error(`获取目录文章失败: ${directory}`, error)
    return []
  }
}

// 获取指定标签的所有文章
export async function getPostsByTag(tag) {
  try {
    const allPosts = await getAllPostsFromBackend()
    const posts = allPosts
      .filter(post => {
        if (post.type !== 'post') return false
        const tags = parseTags(post.tags)
        return tags.includes(tag)
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
    
    return posts
  } catch (error) {
    console.error(`获取标签文章失败: ${tag}`, error)
    return []
  }
}

// 根据 slug 获取单篇文章
export async function getPost(slug, type='post') {
  try {
    const allPosts = await getAllPostsFromBackend()
    return allPosts.find(post => post.slug === slug && post.type === type) || null
  } catch (error) {
    console.error('获取文章失败:', error)
    return null
  }
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
    if (a.category === b.category) {
      return new Date(b.date) - new Date(a.date)
    }
    return a.category.localeCompare(b.category)
  })
}

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

// 获取文章图片的完整URL
export function getPostImageUrl(slug, imagePath) {
  // 使用站点基础URL，而不是API URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${baseUrl}/posts/${slug}/images/${imagePath}`;
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