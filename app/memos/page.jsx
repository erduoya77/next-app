import MemosWrapper from '../components/memos/MemosWrapper';

export const metadata = {
  title: '碎片记录',
  description: '记录生活中的点点滴滴'
}

export default function MemosPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg shadow-sm dark:shadow-none min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">碎片记录</h1>
      <MemosWrapper />
    </div>
  )
} 