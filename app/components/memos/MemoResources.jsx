'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { getResourceUrl } from '@/app/services/MemosService';

// 动态导入 ImagePreview 组件以优化客户端加载
const ImagePreview = dynamic(() => import('../ui/ImagePreview'), {
  ssr: false,
});

export default function MemoResources({ resources }) {
  const [showPreview, setShowPreview] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  // 分离图片和文件
  const { images, files } = useMemo(() => {
    return {
      images: resources.filter((resource) => resource.type.startsWith('image/')),
      files: resources.filter((resource) => !resource.type.startsWith('image/'))
    };
  }, [resources]);

  // 图片URL列表，用于预览
  const imageUrls = useMemo(() => {
    return images.map(image => getResourceUrl(image.id));
  }, [images]);

  // 处理图片点击
  const handleImageClick = (index, e) => {
    e.preventDefault(); // 阻止默认行为（在新标签页打开）
    setInitialIndex(index);
    setShowPreview(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      {images.length > 0 && (
        <div className={`mt-4 ${images.length === 1 ? 'max-w-2xl' : 'grid grid-cols-2 md:grid-cols-3 gap-2'}`}>
          {images.map((resource, index) => (
            <div
              key={`image-${resource.id}-${index}`}
              className={`relative ${images.length === 1 ? 'pt-[56.25%]' : 'pt-[100%]'} cursor-pointer hover:opacity-90 transition-opacity`}
              onClick={(e) => handleImageClick(index, e)}
            >
              <Image
                src={getResourceUrl(resource.id)}
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
              href={getResourceUrl(resource.id)}
              className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
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

      {/* 图片预览组件 */}
      {showPreview && (
        <ImagePreview
          images={imageUrls}
          initialIndex={initialIndex}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
} 