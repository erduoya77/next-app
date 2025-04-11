import { getPostFromBackend } from '@/lib/api'
import PostDetail from '@/app/components/PostDetail'
import { notFound } from 'next/navigation'

export const dynamicParams = true

export async function generateMetadata({ params }) {
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
}

export default async function PostPage({ params }) {
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
} 