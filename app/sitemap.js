import { getAllPosts } from './services/post'; // 假设你有此方法获取所有文章

export default async function sitemap() {
  // 基础URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  
  // 获取所有文章路径
  const posts = await getAllPosts();
  const postUrls = posts ? posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date || post.updatedAt || new Date()),
    priority: 0.7,
  })) : [];
  
  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/memos`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/timeline`,
      lastModified: new Date(),
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rss`,
      lastModified: new Date(),
      priority: 0.6,
    }
  ];
  
  return [...staticPages, ...postUrls];
} 