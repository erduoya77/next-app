import { logError, handleApiResponse } from './ErrorService';

// 基础 URL 配置 - 解决路径重复问题
const MEMOS_API_BASE = process.env.NEXT_PUBLIC_MEMOS_API_URL || 'https://memos.erduoya.top';
const baseUrl = `${MEMOS_API_BASE}/api/v1/memo`;
const defaultLimit = 10;

// 获取 memos 资源的基础 URL，用于图片和文件
export const getResourceUrl = (resourceId) => {
  return `${MEMOS_API_BASE}/o/r/${resourceId}`;
};

// 获取备忘录列表
export async function fetchMemos(options = {}) {
  try {
    const { limit = defaultLimit, offset = 0, tag = null } = options;
    
    let url = `${baseUrl}?creatorId=1&rowStatus=NORMAL&limit=${limit}&offset=${offset}`;
    if (tag) {
      url += `&tag=${encodeURIComponent(tag)}`;
    }
    
    console.log('API请求URL:', url); // 添加日志用于调试
    
    const response = await fetch(url);
    const data = await handleApiResponse(response);
    
    return { 
      data, 
      hasMore: data.length >= limit,
      error: null
    };
  } catch (error) {
    logError(error, { api: 'fetchMemos', options });
    return { 
      data: [], 
      hasMore: false,
      error: error.userMessage || '加载数据失败，请稍后重试'
    };
  }
}

// 格式化日期
export function formatMemoDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 提取音乐 ID
export function extractMusicId(url) {
  const patterns = [
    /music\.163\.com\/#\/song\?id=(\d+)/,
    /music\.163\.com\/song\?id=(\d+)/,
    /music\.163\.com\/song\/(\d+)/,
    /^(\d+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
} 