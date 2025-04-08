'use client';

import Link from 'next/link';

// 解析标签字符串为数组
function parseTags(tagsString) {
  if (!tagsString) return [];

  // 如果已经是数组，处理数组中的每个元素
  if (Array.isArray(tagsString)) {
    return tagsString.flatMap(tag =>
      tag.split(',').map(t => t.trim()).filter(t => t)
    );
  }

  // 如果是字符串，按逗号分割
  return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
}

export default function PostList({ posts }) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.metadata.slug}
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          {/* 外层 Link 包裹文章卡片的主要内容 */}
          <Link
            href={`/posts/${post.metadata.slug}`}
            className="block group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">
              {post.metadata.title}
            </h2>

            <div className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {new Date(post.metadata.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {post.metadata.cover && (
              <div className="relative aspect-[2/1] mb-4 rounded-lg overflow-hidden">
                <img
                  src={post.metadata.cover}
                  alt={post.metadata.title}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            )}

            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </Link>

          {/* 标签部分移到外层 Link 之外 */}
          {post.metadata.tags && (
            <div className="flex flex-wrap gap-2 mt-4">
              {parseTags(post.metadata.tags).map(tag => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}