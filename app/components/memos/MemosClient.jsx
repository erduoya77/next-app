'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { fetchMemos, formatMemoDate, extractMusicId } from '@/app/services/MemosService';
import { parseMarkdown } from '@/lib/markdown';
import dynamic from 'next/dynamic';

// 动态导入组件
const MemoItem = dynamic(() => import('./MemoItem'), { ssr: false });
const MemoFilter = dynamic(() => import('./MemoFilter'));
const MemoLoadMore = dynamic(() => import('./MemoLoadMore'));
const MemoResources = dynamic(() => import('./MemoResources'), { ssr: false });

// 固定常量
const LIMIT = 10;

export default function MemosClient() {
  // 状态管理
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTag, setCurrentTag] = useState(null);
  const [error, setError] = useState(null);
  
  // refs
  const playerInstancesRef = useRef(new Set());

  // 在组件卸载时清理所有播放器实例
  useEffect(() => {
    return () => {
      // 清理所有播放器实例
      playerInstancesRef.current.forEach(player => {
        if (player && player.aplayer && typeof player.aplayer.destroy === 'function') {
          try {
            player.aplayer.destroy();
          } catch (error) {
            console.warn('Error destroying player:', error);
          }
        }
      });
      playerInstancesRef.current.clear();
    };
  }, []);

  // 监听播放器实例的创建
  useEffect(() => {
    const handleMetingInit = (e) => {
      if (e.detail.aplayer && e.target) {
        playerInstancesRef.current.add(e.target);
      }
    };

    document.addEventListener('meting-js-init', handleMetingInit);

    return () => {
      document.removeEventListener('meting-js-init', handleMetingInit);
    };
  }, []);

  // 加载 highlight.js
  useEffect(() => {
    // 加载并初始化 highlight.js
    const loadHighlight = async () => {
      try {
        const hljs = await import('highlight.js');
        window.hljs = hljs.default;

        // 重新渲染已有的代码块
        document.querySelectorAll('pre code').forEach((block) => {
          window.hljs.highlightElement(block);
        });
      } catch (err) {
        console.error('Failed to load highlight.js:', err);
      }
    };

    loadHighlight();

    return () => {
      // 清理所有 meting-js 实例
      document.querySelectorAll('meting-js').forEach((el) => {
        try {
          if (el && el.player) {
            el.player.destroy();
            el.player = null;
          }
        } catch (err) {
          console.error('Error destroying meting-js instance:', err);
        }
      });
    };
  }, []);

  // 处理 Markdown 内容 - 使用 useCallback 优化
  const processContent = useCallback((content) => {
    // 创建占位符数组
    let placeholders = [];
    let placeholderIndex = 0;

    // 预处理有序列表，确保每个列表项前有正确的空格和换行
    content = content.replace(/^(\d+)\.\s*/gm, (match, num) => {
      // 确保列表项前有空行
      return `\n${num}. `;
    });

    // 预处理无序列表
    content = content.replace(/^[-*]\s*/gm, (match) => {
      // 确保列表项前有空行
      return '\n- ';
    });

    // 处理标签
    content = content.replace(/#([\u4e00-\u9fa5a-zA-Z0-9_]+)(?=\s|$)/g, (match, tag) => {
      const placeholder = `PLACEHOLDER_${placeholderIndex++}`;
      placeholders.push({
        placeholder,
        html: `<a href="javascript:void(0)" onclick="window.filterByTag('${tag}')" class="memo-tag">#${tag}</a>`,
      });
      return placeholder;
    });

    // 处理音乐链接的函数 - 内联定义
    const processMusicLink = (title, url) => {
      const id = extractMusicId(url);
      if (!id) return url;

      const placeholder = `PLACEHOLDER_${placeholderIndex++}`;
      placeholders.push({
        placeholder,
        html: `<div class="memo-music-wrapper">
          <meting-js 
            server="netease" 
            type="song" 
            id="${id}"
            theme="#1989fa"
            preload="none"
            autoplay="false"
            list-folded="true"
            list-max-height="100px"
          ></meting-js>
        </div>`,
      });
      return placeholder;
    };

    // 处理 Markdown 链接
    content = content.replace(/\[(.*?)\]\((.*?)\)/g, (match, title, url) => {
      if (url.includes('music.163.com') || /^\d+$/.test(url)) {
        return processMusicLink(title, url);
      }
      return match;
    });

    // 处理纯文本链接
    content = content.replace(/(?<!\\)"<meting-js[^>]*><\/meting-js>"/g, (match) => {
      const idMatch = match.match(/id="(\d+)"/);
      if (idMatch) {
        return processMusicLink('', idMatch[1]);
      }
      return match;
    });

    try {
      // 使用 parseMarkdown 处理内容
      const result = parseMarkdown({ content });
      
      // 恢复占位符
      let finalContent = result.content;
      placeholders.forEach(({ placeholder, html }) => {
        finalContent = finalContent.replace(placeholder, html);
      });

      // 添加样式类
      finalContent = finalContent
        .replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 2em;">')
        .replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 2em;">');

      return finalContent;
    } catch (error) {
      console.error('Error processing markdown content:', error);
      return content;
    }
  }, []);

  // 渲染资源列表 - 使用 MemoResources 组件替代
  const renderResources = useCallback((resources) => {
    return <MemoResources resources={resources} />;
  }, []);

  // 标签筛选 - 使用 useCallback 优化
  const filterByTag = useCallback(async (tag) => {
    if (currentTag === tag) {
      clearFilter();
      return;
    }

    setCurrentTag(tag);
    setMemos([]);
    setHasMore(true);
    
    setLoading(true);
    try {
      const result = await fetchMemos({ tag, limit: LIMIT });
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setHasMore(result.hasMore);
      setMemos(result.data);
    } catch (error) {
      console.error('Error loading memos:', error);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [currentTag]);

  // 添加到window对象，使onclick能够工作
  useEffect(() => {
    // 添加到window对象
    window.filterByTag = filterByTag;
    
    // 清理函数
    return () => {
      delete window.filterByTag;
    };
  }, [filterByTag]); // 当currentTag变化时重新设置，确保闭包能访问最新的状态

  // 初始加载
  useEffect(() => {
    // 只在组件挂载时加载一次数据
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const result = await fetchMemos({ limit: LIMIT });
        
        if (result.error) {
          setError(result.error);
          return;
        }

        setHasMore(result.hasMore);
        setMemos(result.data);
      } catch (error) {
        console.error('Error loading initial memos:', error);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 清除筛选
  const clearFilter = useCallback(async () => {
    setCurrentTag(null);
    setMemos([]);
    setHasMore(true);
    
    setLoading(true);
    try {
      const result = await fetchMemos({ limit: LIMIT });
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setHasMore(result.hasMore);
      setMemos(result.data);
    } catch (error) {
      console.error('Error loading memos:', error);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const result = await fetchMemos({ 
        offset: memos.length, 
        limit: LIMIT,
        tag: currentTag
      });
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setHasMore(result.hasMore);
      setMemos(prev => [...prev, ...result.data]);
    } catch (error) {
      console.error('Error loading more memos:', error);
      setError('加载更多数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, memos.length, currentTag]);

  // 使用 useMemo 优化 memos 数据
  const memoItems = useMemo(() => {
    return memos.map((memo, index) => (
      <MemoItem
        key={`memo-${memo.id}-${index}`}
        memo={memo}
        formatDate={formatMemoDate}
        processContent={processContent}
        renderResources={renderResources}
      />
    ));
  }, [memos, processContent, renderResources]);

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-700 dark:text-red-400">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded-lg"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div>
      <MemoFilter currentTag={currentTag} onClearFilter={clearFilter} />

      <div className="space-y-6">
        {memoItems}
      </div>

      <MemoLoadMore 
        loading={loading} 
        hasMore={hasMore} 
        onLoadMore={loadMore} 
        memosCount={memos.length}
      />
    </div>
  );
} 