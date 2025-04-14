/**
 * 统一的错误处理服务
 */

// 记录错误日志
export function logError(error, extraInfo = {}) {
  console.error('应用错误:', error, extraInfo);
  
  // 这里可以集成第三方错误监控服务，如 Sentry
  // 或将错误信息发送到自己的服务器
  
  // 示例：如果有条件可以发送到服务器
  // if (process.env.NODE_ENV === 'production') {
  //   sendErrorToServer(error, extraInfo);
  // }
}

// 为常见错误类型提供友好的用户消息
export function getFriendlyErrorMessage(error) {
  if (!error) return '发生未知错误';
  
  // 网络错误
  if (error.name === 'NetworkError' || error.message?.includes('network')) {
    return '网络连接失败，请检查您的网络设置并重试';
  }
  
  // API 错误
  if (error.status === 404) {
    return '请求的资源不存在';
  }
  
  if (error.status === 401 || error.status === 403) {
    return '您没有权限访问此内容';
  }
  
  if (error.status >= 500) {
    return '服务器暂时不可用，请稍后重试';
  }
  
  // 如果是自定义错误消息，直接返回
  if (error.userMessage) {
    return error.userMessage;
  }
  
  // 默认错误消息
  return error.message || '发生错误，请重试';
}

// 创建带有用户友好消息的错误
export function createUserError(message, originalError = null) {
  const error = new Error(message);
  error.userMessage = message;
  error.originalError = originalError;
  return error;
}

// API 错误处理
export async function handleApiResponse(response) {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    let errorData;
    
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      errorData = { message: errorText };
    }
    
    const error = new Error(errorData.message || `API error: ${response.status}`);
    error.status = response.status;
    error.data = errorData;
    error.userMessage = getFriendlyErrorMessage(error);
    
    throw error;
  }
  
  return response.json();
} 