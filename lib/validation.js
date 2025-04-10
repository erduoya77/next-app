import { config } from '@/config/config'

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