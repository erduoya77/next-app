import Link from 'next/link'

export default function TagCloud({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(tags).map(([tag, count]) => (
        <Link
          key={tag}
          href={`/search?tag=${encodeURIComponent(tag)}`}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm hover:bg-blue-500 hover:text-white transition-colors"
        >
          {tag} ({count})
        </Link>
      ))}
    </div>
  )
} 