'use client';

import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  className = '',
  variant = 'default', // default, outline, compact
  hoverable = false,
  onClick,
  as: Component = 'div',
  ...props
}, ref) => {
  // 基础样式
  const baseStyle = 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden';
  
  // 变体样式
  const variantStyles = {
    default: 'shadow-md dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700',
    outline: 'border border-gray-200 dark:border-gray-700',
    compact: 'p-2 shadow-sm dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700'
  };
  
  // 悬停样式
  const hoverStyle = hoverable ? 'hover:shadow-lg dark:hover:shadow-gray-900/40 transition-shadow duration-300' : '';
  
  // 如果提供了 onClick，确保有合适的光标样式
  const cursorStyle = onClick ? 'cursor-pointer' : '';
  
  // 获取正确的元素类型
  const TagName = Component;
  
  return (
    <TagName
      ref={ref}
      className={`
        ${baseStyle}
        ${variantStyles[variant] || variantStyles.default}
        ${hoverStyle}
        ${cursorStyle}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </TagName>
  );
});

Card.displayName = 'Card';

// 导出 Card 的子组件
export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </div>
);

export const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`px-4 py-3 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </div>
);

export default Card; 