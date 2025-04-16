import { NextResponse } from 'next/server'

// 添加一个明显的日志，表示路由被加载


export async function GET(request, context) {
  
  
  try {
    const { slug, image } = context.params
    
    // 从环境变量获取后端API地址
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    
    // 构建后端API的图片URL
    const imageUrl = `${apiBaseUrl}/images/${slug}/${image}`
    
    console.log('正在请求图片:', {
      slug,
      image,
      apiBaseUrl,
      imageUrl
    })
    
    // 从后端API获取图片
    const response = await fetch(imageUrl)
    
    console.log('后端API响应:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (!response.ok) {
      console.error(`从后端获取图片失败: ${imageUrl}`, response.status)
      return new NextResponse('Image not found', { status: 404 })
    }
    
    // 获取图片数据和Content-Type
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'
    
    console.log('图片数据获取成功:', {
      contentType,
      bufferSize: imageBuffer.byteLength
    })
    
    // 返回图片响应
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 