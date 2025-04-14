'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Card, { CardContent } from '../ui/Card';

export default function MemoItem({ 
  memo, 
  formatDate, 
  processContent, 
  renderResources,
  onTagClick 
}) {
  // 用于在组件挂载/更新后处理代码高亮等效果
  const memoRef = useRef(null);

  useEffect(() => {
    if (memoRef.current && window.hljs) {
      // 高亮代码块
      memoRef.current.querySelectorAll('pre code').forEach((block) => {
        try {
          // 重置高亮状态
          if (block.hasAttribute('data-highlighted')) {
            block.removeAttribute('data-highlighted');
          }
          // 应用高亮
          window.hljs.highlightElement(block);
        } catch (error) {
          console.error('代码高亮出错:', error);
        }
      });
    }
    
    // 查找并处理所有的 meting-js 元素
    if (memoRef.current) {
      const metingElements = memoRef.current.querySelectorAll('meting-js');
      if (metingElements.length > 0 && window.customElements) {
        // 如果还没有注册该元素，且已加载 customElements
        if (!customElements.get('meting-js') && typeof APlayer !== 'undefined') {
          // 触发加载
          metingElements.forEach(el => {
            try {
              // 触发元素更新
              el.setAttribute('preload', 'none');
            } catch (e) {
              console.warn('初始化 meting-js 元素失败', e);
            }
          });
        }
      }
    }
  }, [memo.id]); // 只在 memo.id 变化时执行

  return (
    <Card>
      <CardContent ref={memoRef}>
        <div className="flex items-center gap-3 mb-3">
          <Image
            src="/images/avatar.png"
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full memo-avatar dark:brightness-90"
            priority
          />
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {formatDate(memo.createdTs)}
          </span>
        </div>

        <div
          className="prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:marker:text-current break-words"
          dangerouslySetInnerHTML={{ __html: processContent(memo.content) }}
        />

        {memo.resourceList?.length > 0 && renderResources(memo.resourceList)}
      </CardContent>
    </Card>
  );
} 