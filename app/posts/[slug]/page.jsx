import { getPostFromBackend } from '@/lib/api'
import PostDetail from '@/app/components/PostDetail'
import { notFound } from 'next/navigation'

export const dynamicParams = true

export async function generateMetadata({ params }) {
  try {
    params = await params
    const post = await getPostFromBackend(params.slug)
    
    if (!post) {
      return {
        title: '文章不存在',
        description: '请检查文章链接是否正确'
      }
    }

    return {
      title: `${post.title} - 我的博客`,
      description: post.excerpt || post.title
    }
  } catch (error) {
    console.error('获取文章元数据失败:', error)
    return {
      title: '加载错误',
      description: '文章加载失败，请稍后再试'
    }
  }
}

export default async function PostPage({ params }) {
  try {
    params = await params
    const post = await getPostFromBackend(params.slug)
    
    if (!post || post.type !== 'post') {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <PostDetail post={post} />
      </div>
    )
  } catch (error) {
    console.error('文章详情页加载失败:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">加载错误</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            文章加载失败，请稍后再试或返回首页
          </p>
          <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            返回首页
          </a>
        </div>
      </div>
    )
  }
} 