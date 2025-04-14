import { getAllPosts } from '../../services/post'; // 假设你有此方法获取所有文章

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || '我的博客';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '我的个人博客网站';
  
  // 获取所有文章
  const posts = await getAllPosts();
  
  // 生成RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${posts
      ? posts.map(post => {
        // 确保有效的日期
        const pubDate = post.date || post.createdAt || post.updatedAt || new Date();
        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>
      <description>${escapeXml(post.description || post.excerpt || '')}</description>
      ${post.categories && post.categories.length > 0 
        ? post.categories.map(category => 
          `<category>${escapeXml(category)}</category>`
        ).join('') 
        : ''}
    </item>`;
      }).join('')
      : ''}
  </channel>
</rss>`;

  // 返回带有正确Content-Type的XML
  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}

// 辅助函数：转义XML特殊字符
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 