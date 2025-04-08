'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { config } from '@/config/config';
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ tags, directories, social, footer }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <>
      <aside
        className={`h-screen bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 fixed left-0 top-0 overflow-y-auto flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo/标题区域 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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

        {/* 目录导航 */}
        <nav className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'items-center' : ''}`}>
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

        {!isCollapsed && (
          <>
            {/* 标签云 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-1">
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
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
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
            <footer className="p-4 text-sm text-gray-500 dark:text-gray-400">
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
          </>
        )}
      </aside>

      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <main className="p-8">{/* 主内容 */}</main>
      </div>
    </>
  );
}