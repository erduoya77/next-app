import { redirect } from 'next/navigation'

export default function CategoryPage({ params }) {
  const { category } = params
  redirect(`/search?category=${encodeURIComponent(category)}`)
} 