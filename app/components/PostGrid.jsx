'use client'

import Masonry from 'react-masonry-css'
import PostCard from './PostCard'

const breakpointColumns = {
  default: 4,
  1536: 3,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1
}

export default function PostGrid({ posts }) {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding dark:bg-gray-900"
    >
      {posts.map(post => (
        <div key={post.slug} className="mb-4 transition-transform hover:scale-[1.02]">
          <PostCard post={post} />
        </div>
      ))}
    </Masonry>
  )
} 