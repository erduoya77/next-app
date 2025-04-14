'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { config } from '@/config/config';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ tags, directories, social, footer }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 监听窗口大小变化
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      // 使用防抖来避免频繁触发
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.innerWidth >= 1024) {
          setIsMobileMenuOpen(false);
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    // 初始检查一次
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // 处理移动端菜单点击
  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // 处理遮罩层点击
  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={handleMobileMenuClick}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-950/50 dark:border dark:border-gray-700"
        aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* 移动端菜单遮罩 */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-[40] transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 flex flex-col bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-950/50 dark:border-r dark:border-gray-700 transition-all duration-300 z-[50] overflow-hidden
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* 内容容器 */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo/标题区域 */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-2' : ''}`}>
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
                <Image 
                  src="/favicon.ico" 
                  alt="Logo" 
                  width={isCollapsed ? 32 : 24} 
                  height={isCollapsed ? 32 : 24}
                  className="object-contain pointer-events-none"
                />
                {!isCollapsed && (
                  <div>
                    <Link
                      href="/"
                      className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 text-xl"
                    >
                      {config.site.title}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {config.site.description}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                aria-label={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
              >
                {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 导航区域 */}
          <nav className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
            <ul className="space-y-2">
              {directories?.map((dir) => (
                <li key={dir.path || dir.name}>
                  {dir.type === 'menu' ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(dir.name)}
                        className={`w-full text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center group py-2 ${
                          isCollapsed ? 'justify-center' : ''
                        }`}
                        title={dir.name}
                      >
                        {dir.icon && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {dir.icon}
                          </span>
                        )}
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left ml-2">
                              {dir.name}
                            </span>
                            {openMenus[dir.name] ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </>
                        )}
                      </button>
                      {!isCollapsed && openMenus[dir.name] && dir.children && (
                        <ul className="ml-6 mt-2 mb-2">
                          {dir.children.map((child) => (
                            <li key={child.path} className="mb-2">
                              <Link
                                href={child.path}
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center text-sm py-2 block"
                                title={child.name}
                              >
                                {child.icon && (
                                  <span className="mr-2 text-gray-500 dark:text-gray-400">
                                    {child.icon}
                                  </span>
                                )}
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={dir.path}
                      className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center group py-2 ${
                        isCollapsed ? 'justify-center' : ''
                      }`}
                      title={dir.name}
                    >
                      {dir.icon && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {dir.icon}
                        </span>
                      )}
                      {!isCollapsed && (
                        <span className="flex-1 ml-2">{dir.name}</span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* 标签和社交链接区域 - 使用 flex-1 确保它能填充剩余空间 */}
          {!isCollapsed && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* 标签云 - 允许滚动 */}
              <div className="flex-1 p-4 border-b border-gray-200 dark:border-gray-700 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">标签</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tags || {}).map(([tag, count]) => (
                    <Link
                      key={tag}
                      href={`/search?tag=${encodeURIComponent(tag)}`}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {tag} ({count})
                    </Link>
                  ))}
                </div>
              </div>

              {/* 社交链接 */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">社交链接</h2>
                <div className="flex gap-4">
                  {social?.github && (
                    <a
                      href={social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      GitHub
                    </a>
                  )}
                  {social?.email && (
                    <a
                      href={`mailto:${social.email}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      📮
                    </a>
                  )}
                </div>
              </div>

              {/* 页脚 */}
              <footer className="flex-shrink-0 p-4 text-sm text-gray-500 dark:text-gray-400">
                <div>{footer?.copyright}</div>
                {footer?.beian && (
                  <div className="mt-1">
                    <a
                      href="https://beian.miit.gov.cn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {footer.beian}
                    </a>
                  </div>
                )}
              </footer>
            </div>
          )}
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <main className="p-8">{/* 主内容 */}</main>
      </div>
    </>
  );
}