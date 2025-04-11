import { getPostFromBackend } from '@/lib/api'
import PostDetail from '@/app/components/PostDetail'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // 每小时重新验证

export async function generateMetadata() {
  const post = await getPostFromBackend('about')
  
  if (!post) {
    return {
      title: '页面不存在',
      description: '请检查页面链接是否正确'
    }
  }

  return {
    title: `${post.title} - 我的博客`,
    description: post.excerpt || post.title
  }
}

export default async function AboutPage() {
  const post = await getPostFromBackend('about')
  
  if (!post || post.type !== 'page') {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
    </div>
  )
} 