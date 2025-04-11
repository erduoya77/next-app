'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function Comments() {
  const pathname = usePathname();
  const containerRef = useRef(null);
  const initialized = useRef(false);
  
  // 从环境变量获取Twikoo服务器地址
  const twikooEnvId = process.env.NEXT_PUBLIC_TWIKOO_ENV_ID || 'https://twikoo.erduoya.top/';

  // 定义不需要评论的页面路径
  const excludedPaths = ['/', '/search', '/tags'];

  // 检查当前路径是否需要显示评论
  const shouldShowComments = !excludedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    // 如果当前页面不需要显示评论，则不初始化
    if (!shouldShowComments) {
      return;
    }

    // 如果已经初始化过，先清除现有评论区
    if (initialized.current) {
      const container = containerRef.current;
      if (container) {
        container.innerHTML = '';
      }
    }

    // 初始化 Twikoo
    const initTwikoo = () => {
      if (window.twikoo) {
        window.twikoo.init({
          envId: twikooEnvId,
          el: '#comments',
          path: pathname,
          lang: 'zh-CN',
        });
        initialized.current = true;
      }
    };

    // 如果 twikoo 已加载，直接初始化
    if (window.twikoo) {
      initTwikoo();
    }

    // 监听 twikoo 脚本加载完成事件
    const handleTwikooLoad = () => {
      initTwikoo();
    };

    window.addEventListener('twikoo-loaded', handleTwikooLoad);

    return () => {
      window.removeEventListener('twikoo-loaded', handleTwikooLoad);
      initialized.current = false;
    };
  }, [pathname, shouldShowComments, twikooEnvId]);

  // 如果当前页面不需要显示评论，则不渲染组件
  if (!shouldShowComments) {
    return null;
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/twikoo@1.6.31/dist/twikoo.all.min.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.dispatchEvent(new Event('twikoo-loaded'));
        }}
      />
      <div className="max-w-4xl mx-auto mt-60 mb-8 px-4">
        <div id="comments" ref={containerRef} />
      </div>
    </>
  );
} 