import { getPost } from '@/lib/api'
import PostDetail from '@/app/components/PostDetail'
import { notFound } from 'next/navigation'

export const dynamicParams = true

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: '文章不存在',
      description: '请检查文章链接是否正确'
    }
  }

  return {
    title: `${post.metadata.title} - 我的博客`,
    description: post.metadata.description || post.metadata.title
  }
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
    </div>
  )
} 