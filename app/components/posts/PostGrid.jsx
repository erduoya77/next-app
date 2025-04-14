'use client'

import { memo, useMemo } from 'react'
import Masonry from 'react-masonry-css'
import dynamic from 'next/dynamic'

// 动态导入 PostCard 以减少初始加载时间
const PostCard = dynamic(() => import('./PostCard'), {
  ssr: true,
  loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
})

const breakpointColumns = {
  default: 4,
  1536: 3,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1
}

function PostGrid({ posts }) {
  // 使用 useMemo 缓存帖子列表，避免不必要的重渲染
  const postItems = useMemo(() => {
    return posts.map(post => (
      <div key={post.slug} className="mb-4 transition-transform hover:scale-[1.02]">
        <PostCard post={post} />
      </div>
    ))
  }, [posts])

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding dark:bg-gray-900"
    >
      {postItems}
    </Masonry>
  )
}

// 使用 memo 优化组件，避免不必要的重渲染
export default memo(PostGrid) 