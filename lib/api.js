import { config } from '@/config/config'
import path from 'path'
import { parseMarkdownFile, getAllMarkdownFiles, sortPostsByDate, getPostExcerpt } from './markdown'
import { validatePostMetadata } from './validation'


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
            } else {
              
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
            } else {
              
            }
          }
        }
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
    const response = await getAllMarkdownFiles(directory)
    
    
    const posts = []
    
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
            
            // 添加文章摘要
            post.excerpt = getPostExcerpt(post.content)
            posts.push(post)
          }
        } else {
          // 如果是文件路径，使用原来的处理逻辑
          
          for (const file of response) {
            const post = await parseMarkdownFile(file)
            if (post) {
              // 添加文章摘要
              post.excerpt = getPostExcerpt(post.content)
              posts.push(post)
            }
          }
        }
      }
    } else {
      console.error('API返回的数据格式不正确:', response)
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
      const response = await getAllMarkdownFiles(dir.path)
      
      // 检查响应的类型
      if (Array.isArray(response)) {
        // 如果是数组，检查第一个元素的类型
        if (response.length > 0) {
          const firstItem = response[0]
          
          // 如果是对象并且有metadata字段，说明是文章对象
          if (typeof firstItem === 'object' && firstItem !== null && firstItem.metadata) {
            
            // 直接处理文章对象
            for (const post of response) {
              if (!post || !post.metadata) continue
              
              if (post.metadata.tags && post.metadata.tags.includes(tag)) {
                // 添加文章摘要
                post.excerpt = getPostExcerpt(post.content)
                posts.push(post)
              }
            }
          } else {
            // 如果是文件路径，使用原来的处理逻辑
            
            for (const file of response) {
              const post = await parseMarkdownFile(file)
              if (post && post.metadata.tags && post.metadata.tags.includes(tag)) {
                // 添加文章摘要
                post.excerpt = getPostExcerpt(post.content)
                posts.push(post)
              }
            }
          }
        }
      } else {
        console.error('API返回的数据格式不正确:', response)
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