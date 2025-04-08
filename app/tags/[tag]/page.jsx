import { redirect } from 'next/navigation'

export default function TagPage({ params }) {
  const { tag } = params
  redirect(`/search?tag=${encodeURIComponent(tag)}`)
} 