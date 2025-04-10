'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { parseMarkdown } from '@/lib/markdown';

const limit = 10;
const baseUrl = 'https://memos.erduoya.top/api/v1/memo';

export default function MemosClient() {
  const [memos, setMemos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTag, setCurrentTag] = useState(null);
  const observerRef = useRef(null);
  const lastMemoRef = useRef(null);

  // 格式化日期
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 处理 Markdown 内容
  const processContent = (content) => {
    
    
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

    // 处理网易云音乐链接
    const extractMusicId = (url) => {
      const patterns = [
        /music\.163\.com\/#\/song\?id=(\d+)/,
        /music\.163\.com\/song\?id=(\d+)/,
        /music\.163\.com\/song\/(\d+)/,
        /^(\d+)$/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    // 处理音乐链接
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
            preload="metadata"
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

      
      
      // 检查是否包含有序列表标签
      if (finalContent.includes('<ol>') || finalContent.includes('<li>')) {
        console.log('列表标签检测:', {
          hasOL: finalContent.includes('<ol>'),
          hasLI: finalContent.includes('<li>'),
          listItems: finalContent.match(/<li>.*?<\/li>/g)
        });
      }

      return finalContent;
    } catch (error) {
      console.error('Error processing markdown content:', error);
      return content;
    }
  };

  // 标签筛选
  const filterByTag = async (tag) => {
    if (currentTag === tag) {
      clearFilter();
      return;
    }

    setCurrentTag(tag);
    setMemos([]);
    setHasMore(true);
    
    // 直接在这里调用 API
    setLoading(true);
    try {
      const url = `${baseUrl}?creatorId=1&rowStatus=NORMAL&limit=${limit}&offset=0&tag=${encodeURIComponent(tag)}`;
      

      const response = await fetch(url);
      const data = await response.json();

      if (data.length < limit) {
        setHasMore(false);
      }

      setMemos(data);
    } catch (error) {
      console.error('Error loading memos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加到window对象，使onclick能够工作
  useEffect(() => {
    // 添加到window对象
    window.filterByTag = filterByTag;
    
    // 清理函数
    return () => {
      delete window.filterByTag;
    };
  }, [currentTag]); // 当currentTag变化时重新设置，确保闭包能访问最新的状态

  // 初始加载
  useEffect(() => {
    // 只在组件挂载时加载一次数据
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const url = `${baseUrl}?creatorId=1&rowStatus=NORMAL&limit=${limit}&offset=0`;
        

        const response = await fetch(url);
        const data = await response.json();

        if (data.length < limit) {
          setHasMore(false);
        }

        setMemos(data);
      } catch (error) {
        console.error('Error loading initial memos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // 清除筛选
  const clearFilter = async () => {
    setCurrentTag(null);
    setMemos([]);
    setHasMore(true);
    
    // 直接在这里调用 API
    setLoading(true);
    try {
      const url = `${baseUrl}?creatorId=1&rowStatus=NORMAL&limit=${limit}&offset=0`;
      

      const response = await fetch(url);
      const data = await response.json();

      if (data.length < limit) {
        setHasMore(false);
      }

      setMemos(data);
    } catch (error) {
      console.error('Error loading memos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载更多
  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let url = `${baseUrl}?creatorId=1&rowStatus=NORMAL&limit=${limit}&offset=${memos.length}`;
      if (currentTag) {
        url += `&tag=${encodeURIComponent(currentTag)}`;
      }

      

      const response = await fetch(url);
      const data = await response.json();

      if (data.length < limit) {
        setHasMore(false);
      }

      setMemos(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error loading more memos:', error);
    } finally {
      setLoading(false);
    }
  };

  // 渲染资源列表
  const renderResources = (resources) => {
    const images = resources.filter((resource) => resource.type.startsWith('image/'));
    const files = resources.filter((resource) => !resource.type.startsWith('image/'));

    return (
      <>
        {images.length > 0 && (
          <div className={`mt-4 ${images.length === 1 ? 'max-w-2xl' : 'grid grid-cols-2 md:grid-cols-3 gap-2'}`}>
            {images.map((resource, index) => (
              <div
                key={`image-${resource.id}-${index}`}
                className={`relative ${images.length === 1 ? 'pt-[56.25%]' : 'pt-[100%]'}`}
              >
                <Image
                  src={`https://memos.erduoya.top/o/r/${resource.id}`}
                  alt="memo image"
                  fill
                  className={`object-cover rounded ${images.length === 1 ? 'object-contain' : ''}`}
                />
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((resource, index) => (
              <a
                key={`file-${resource.id}-${index}`}
                href={`https://memos.erduoya.top/o/r/${resource.id}`}
                className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm">{resource.filename}</span>
              </a>
            ))}
          </div>
        )}
      </>
    );
  };

  // 设置无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (lastMemoRef.current) {
      observer.observe(lastMemoRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  // 初始化
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

  return (
    <div>
      {currentTag && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 rounded">
          <span>当前筛选：#{currentTag}</span>
          <button
            onClick={clearFilter}
            className="text-sm px-2 py-1 bg-white rounded hover:bg-gray-200"
          >
            清除筛选
          </button>
        </div>
      )}

      <div className="space-y-6">
        {memos.map((memo, index) => (
          <div key={`memo-${memo.id}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/images/avatar.png"
                alt="avatar"
                width={40}
                height={40}
                className="rounded-full memo-avatar"
                no-view="true"
                priority
              />
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {formatDate(memo.createdTs)}
              </span>
            </div>

            <div
              className="prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:marker:text-current"
              dangerouslySetInnerHTML={{ __html: processContent(memo.content) }}
            />

            {memo.resourceList?.length > 0 && renderResources(memo.resourceList)}
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-4">加载中...</div>}

      {!loading && !hasMore && memos.length > 0 && (
        <div className="text-center py-4 text-gray-500">没有更多内容了</div>
      )}

      {!loading && memos.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          {currentTag ? '没有找到相关内容' : '暂无内容'}
        </div>
      )}

      <div ref={lastMemoRef} className="h-4" />
    </div>
  );
}