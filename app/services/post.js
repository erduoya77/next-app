/**
 * 文章相关服务
 */

// 获取所有文章
export async function getAllPosts() {
  try {
    // 这里应该根据你的实际数据获取方式进行调整
    // 可能是从API获取，或从本地文件系统获取
    
    // 假设你使用fetch从API获取
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);
        if (response.ok) {
          const posts = await response.json();
          return posts;
        }
      } catch (apiError) {
        console.error('从API获取文章失败，回退到示例数据:', apiError);
      }
    }
    
    // 如果API获取失败或未配置API，则使用示例数据
    // 在实际项目中，建议实现从本地文件系统读取markdown文件的逻辑
    const posts = [
      {
        slug: 'hello-world',
        title: '你好，世界',
        date: '2023-10-01',
        description: '这是我的第一篇博客文章',
        excerpt: '欢迎来到我的博客，这是我的第一篇文章。在这里，我将分享我的编程经验和生活感悟。',
        categories: ['教程', '开始'],
        content: '这是文章内容...'
      }
    ];
    
    return posts;
  } catch (error) {
    console.error('获取文章失败:', error);
    return [];
  }
}

// 根据slug获取文章详情
export async function getPostBySlug(slug) {
  try {
    // 这里应该根据你的实际数据获取方式进行调整
    
    // 先尝试从API获取
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${slug}`);
        if (response.ok) {
          const post = await response.json();
          return post;
        }
      } catch (apiError) {
        console.error(`从API获取文章 ${slug} 失败:`, apiError);
      }
    }
    
    // 如果API获取失败或未配置API，则从本地数据中查找
    const posts = await getAllPosts();
    return posts.find(post => post.slug === slug);
  } catch (error) {
    console.error(`获取文章 ${slug} 失败:`, error);
    return null;
  }
} 