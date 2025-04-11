'use client';

import Link from 'next/link';

// 解析标签字符串为数组
function parseTags(tagsString) {
  if (!tagsString) return [];
  if (Array.isArray(tagsString)) return tagsString;
  return tagsString.split(/[,，\s]+/).map(tag => tag.trim()).filter(Boolean);
}

export default function PostList({ posts, simplifiedView = false }) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article
          key={post.slug}
          className={`p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
            simplifiedView ? 'py-4' : ''
          }`}
        >
          {/* 外层 Link 包裹文章卡片的主要内容 */}
          <Link
            href={`/posts/${post.slug}`}
            className="block group"
          >
            <h2 className={`text-xl font-semibold group-hover:text-blue-500 transition-colors ${
              simplifiedView ? 'mb-1' : 'mb-2'
            }`}>
              {post.title}
            </h2>

            <div className={`text-gray-600 dark:text-gray-400 text-sm ${
              simplifiedView ? 'mb-0' : 'mb-4'
            }`}>
              {new Date(post.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {post.category && simplifiedView && (
                <span className="ml-2 text-gray-500 dark:text-gray-400">
                  · {post.category}
                </span>
              )}
            </div>

            {!simplifiedView && post.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mt-2">
                {post.excerpt}
              </p>
            )}
          </Link>

          {/* 标签部分移到外层 Link 之外 */}
          {post.tags && (
            <div className={`flex flex-wrap gap-2 ${
              simplifiedView ? 'mt-2' : 'mt-4'
            }`}>
              {parseTags(post.tags).map(tag => (
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