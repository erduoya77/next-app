import Image from 'next/image'
import Link from 'next/link'
import { getAllPosts } from '@/lib/markdown'

export default async function GalleryPage() {
  try {
    const posts = await getAllPosts()
    
    if (!posts || posts.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">图片库</h1>
          <p className="text-gray-600">暂无图片</p>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">图片库</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.slug} className="bg-white rounded-lg shadow-md overflow-hidden">
              {post.coverImage && (
                <div className="relative h-48">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                <Link 
                  href={`/gallery/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('加载图片库失败:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">图片库</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">加载图片库时发生错误，请稍后重试。</p>
        </div>
      </div>
    )
  }
} 