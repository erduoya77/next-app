'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { parseMarkdown } from '@/lib/markdown';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const limit = 10;
const baseUrl = 'https://memos.erduoya.top/api/v1/memo';

export default function MemosClient() {
  const [memos, setMemos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTag, setCurrentTag] = useState(null);
  const [copiedStates, setCopiedStates] = useState({});
  const observerRef = useRef(null);
  const lastMemoRef = useRef(null);
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

  // 处理代码复制
  const handleCopyClick = async (code, blockId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedStates(prev => ({ ...prev, [blockId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [blockId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // 处理代码块
  const processCodeBlocks = () => {
    const codeBlocks = document.querySelectorAll('.prose pre code');
    codeBlocks.forEach((block, index) => {
      const blockId = `code-block-${index}`;
      if (!block.getAttribute('data-processed')) {
        const pre = block.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'relative group';
        
        // 创建复制按钮
        const button = document.createElement('button');
        button.className = 
          'absolute right-2 top-2 p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200';
        button.innerHTML = `
          <span class="copy-icon w-5 h-5 block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
            </svg>
          </span>
          <span class="check-icon hidden w-5 h-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
            </svg>
          </span>
        `;

        button.addEventListener('click', () => {
          const code = block.textContent;
          handleCopyClick(code, blockId);
          
          const copyIcon = button.querySelector('.copy-icon');
          const checkIcon = button.querySelector('.check-icon');
          
          copyIcon.classList.add('hidden');
          checkIcon.classList.remove('hidden');
          
          setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
          }, 2000);
        });

        // 包装代码块
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);
        
        // 标记为已处理
        block.setAttribute('data-processed', 'true');
      }
    });
  };

  // 在内容更新后处理代码块
  useEffect(() => {
    processCodeBlocks();
  }, [memos]);

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
              className="prose dark:prose-invert max-w-none prose-ol:list-decimal prose-ul:list-disc prose-li:marker:text-current break-words"
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