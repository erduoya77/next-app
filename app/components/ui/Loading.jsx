'use client';

import { memo } from 'react';

function Loading({ 
  size = 'md', 
  variant = 'circle',
  text = '加载中...',
  showText = true,
  className = '',
  fullPage = false,
}) {
  // 尺寸样式
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // 变体组件
  const variants = {
    circle: (
      <div className={`${sizeStyles[size] || sizeStyles.md} ${className}`}>
        <svg
          className="animate-spin w-full h-full text-blue-600 dark:text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    ),
    dots: (
      <div className={`flex space-x-2 ${className}`}>
        <div className={`${sizeStyles[size] || sizeStyles.md} bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeStyles[size] || sizeStyles.md} bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeStyles[size] || sizeStyles.md} bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    ),
    skeleton: (
      <div className={`${className} w-full h-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse`}></div>
    ),
    bar: (
      <div className={`w-full h-1 ${className} bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-full`}>
        <div className="h-full bg-blue-600 dark:bg-blue-400 animate-progressBar rounded-full"></div>
      </div>
    ),
  };

  // 如果是全页面加载
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 z-50">
        {variants[variant] || variants.circle}
        {showText && <p className="mt-4 text-gray-700 dark:text-gray-300">{text}</p>}
      </div>
    );
  }

  // 普通加载
  return (
    <div className="flex flex-col items-center justify-center">
      {variants[variant] || variants.circle}
      {showText && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}

// 使用 memo 优化组件
export default memo(Loading); 