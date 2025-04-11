import { config } from '@/config/config'

// 验证文章元数据
export function validatePostMetadata(metadata) {
  if (!metadata) {
    throw new Error('文章元数据不能为空')
  }

  // 必需字段验证
  const requiredFields = ['title', 'date']
  for (const field of requiredFields) {
    if (!metadata[field]) {
      throw new Error(`缺少必需的元数据字段: ${field}`)
    }
  }

  // 日期格式验证
  const date = new Date(metadata.date)
  if (isNaN(date.getTime())) {
    throw new Error('日期格式无效')
  }

  // 处理标签
  if (metadata.tags) {
    if (typeof metadata.tags === 'string') {
      metadata.tags = metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    } else if (!Array.isArray(metadata.tags)) {
      throw new Error('标签必须是字符串或数组格式')
    }
  } else {
    metadata.tags = []
  }

  // 处理分类
  if (!metadata.category) {
    metadata.category = '未分类'
  }

  // 处理摘要
  if (!metadata.excerpt) {
    metadata.excerpt = ''
  }

  // 处理封面图片
  if (!metadata.cover) {
    metadata.cover = '/images/default-cover.jpg'  // 设置默认封面图片
  }

  // 处理作者信息
  if (!metadata.author) {
    metadata.author = {
      name: '博主',
      avatar: '/images/default-avatar.jpg'
    }
  } else if (typeof metadata.author === 'string') {
    metadata.author = {
      name: metadata.author,
      avatar: '/images/default-avatar.jpg'
    }
  }

  // 处理阅读时间
  if (!metadata.readingTime) {
    metadata.readingTime = '预计阅读时间：5分钟'
  }

  // 处理文章状态
  if (!metadata.status) {
    metadata.status = 'published'  // 可选值：draft, published, archived
  }

  // 处理创建时间和更新时间
  if (!metadata.createdAt) {
    metadata.createdAt = metadata.date
  }
  if (!metadata.updatedAt) {
    metadata.updatedAt = metadata.date
  }

  return metadata
} 