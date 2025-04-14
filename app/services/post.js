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
      },
      {
        slug: 'how-to-use-nextjs',
        title: '如何使用Next.js',
        date: '2023-10-10',
        description: 'Next.js入门指南',
        excerpt: 'Next.js是一个流行的React框架，它提供了很多便利的功能，比如服务器端渲染、静态生成等。',
        categories: ['教程', 'Next.js'],
        content: '这是文章内容...'
      },
      {
        slug: 'building-a-blog',
        title: '如何搭建一个博客',
        date: '2023-11-05',
        description: '从零开始搭建个人博客的完整教程',
        excerpt: '在这篇文章中，我将详细介绍如何使用Next.js和TailwindCSS搭建一个现代化的个人博客。',
        categories: ['教程', 'Next.js', '博客'],
        content: '这是文章内容...'
      },
      {
        slug: 'tailwindcss-tips',
        title: 'TailwindCSS实用技巧',
        date: '2023-12-15',
        description: 'TailwindCSS的高级使用技巧',
        excerpt: 'TailwindCSS是一个实用优先的CSS框架，本文分享一些使用技巧和最佳实践。',
        categories: ['CSS', '前端'],
        content: '这是文章内容...'
      },
      {
        slug: 'react-state-management',
        title: 'React状态管理最佳实践',
        date: '2024-01-20',
        description: '探讨React应用中的状态管理方案',
        excerpt: '本文比较了React中不同的状态管理方案，包括Context API、Redux、Zustand等。',
        categories: ['React', '前端'],
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