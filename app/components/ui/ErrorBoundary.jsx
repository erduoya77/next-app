'use client';

import { useState, useEffect } from 'react';

export default function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      // 只处理有效的错误
      if (error) {
        console.error('捕获到错误:', error, errorInfo);
        setError(error);
        setHasError(true);
      }
    };

    // 设置全局错误处理
    const handleWindowError = (event) => {
      if (event.error) {
        errorHandler(event.error);
        event.preventDefault();
      }
    };

    // 设置未处理的 Promise 拒绝事件
    const handleRejection = (event) => {
      if (event.reason) {
        errorHandler(new Error(`未处理的 Promise 错误: ${event.reason}`));
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // 使用自定义的错误回退组件，如果提供了的话
  if (hasError) {
    if (fallback) {
      return fallback(error, () => setHasError(false));
    }

    // 默认错误界面
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
        <h2 className="text-lg font-bold mb-2">页面发生错误</h2>
        <p className="mb-4">抱歉，页面加载过程中出现了问题。</p>
        <details className="mb-4">
          <summary className="cursor-pointer">错误详情</summary>
          <p className="mt-2 p-2 bg-red-100 dark:bg-red-800/50 rounded font-mono text-sm overflow-auto">
            {error?.message || '未知错误'}
          </p>
        </details>
        <button
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="px-4 py-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded text-red-800 dark:text-red-200"
        >
          重新加载页面
        </button>
      </div>
    );
  }

  return children;
} 