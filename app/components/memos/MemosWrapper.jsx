'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Loading from '../ui/Loading';
import ErrorBoundary from '../ui/ErrorBoundary';

// 使用动态导入优化加载
const MemosClient = dynamic(() => import('./MemosClient'), {
  ssr: false, // 禁用服务器端渲染，因为该组件使用了客户端特定的API
  loading: () => (
    <div className="py-10 flex justify-center">
      <Loading variant="dots" size="md" text="正在加载内容..." />
    </div>
  )
});

export default function MemosWrapper() {
  const [isClient, setIsClient] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="py-10 flex justify-center">
        <Loading variant="dots" size="md" text="初始化中..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <MemosClient />
    </ErrorBoundary>
  );
} 