import { getAllPostsFromBackend } from '@/lib/api'
import { config } from '@/config/config'
import { parseMarkdown } from '@/lib/markdown'

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const siteName = config.site.title
    const siteDescription = config.site.description

    // 获取所有文章
    const posts = await getAllPostsFromBackend()


    // 生成 RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns="http://backend.userland.com/rss2"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${formatRFC822Date(new Date())}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts.map(post => {
      // 使用 parseMarkdown 渲染摘要内容
      const { content: htmlContent } = parseMarkdown({ 
        content: post.excerpt || '',
        metadata: post.metadata || {}
      })
      
      // 获取正确的日期字段
      const pubDate = post.metadata?.date || post.metadata?.createdAt || post.metadata?.updatedAt || post.date
      
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${formatRFC822Date(new Date(pubDate))}</pubDate>
      <description><![CDATA[${htmlContent}]]></description>
      ${post.metadata?.tags ? `<category>${escapeXml(post.metadata.tags.join(', '))}</category>` : ''}
    </item>`
    }).join('')}
  </channel>
</rss>`

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('生成 RSS 失败:', error)
    return new Response('生成 RSS 失败', { status: 500 })
  }
}

// 辅助函数：转义 XML 特殊字符
function escapeXml(unsafe) {
  if (!unsafe) return ''
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

// 辅助函数：格式化日期为 RFC-822 格式
function formatRFC822Date(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return `${days[date.getUTCDay()]}, ${String(date.getUTCDate()).padStart(2, '0')} ${
    months[date.getUTCMonth()]
  } ${date.getUTCFullYear()} 00:00:00 GMT`
} 