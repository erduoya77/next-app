import { getPost } from '@/lib/api'
import PostDetail from '@/app/components/PostDetail'
import { notFound } from 'next/navigation'

export const metadata = {
  title: '关于 - 我的博客',
  description: '关于我的个人介绍和博客说明'
}

export default async function AboutPage() {
  const post = await getPost('about','page')
  
  if (!post) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostDetail post={post} />
    </div>
  )
} 