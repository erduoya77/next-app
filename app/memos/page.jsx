import MemosClient from '../components/MemosClient'


export const metadata = {
  title: '碎片记录',
  description: '记录生活中的点点滴滴'
}

export default function MemosPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">碎片记录</h1>
      <MemosClient />
    </div>
  )
} 