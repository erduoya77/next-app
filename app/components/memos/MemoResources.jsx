'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// 动态导入 ImagePreview 组件
const ImagePreview = dynamic(() => import('../ui/ImagePreview'), {
  ssr: false, 
});

export default function MemoResources({ resources }) {
  const [previewImages, setPreviewImages] = useState([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // 分离图片和文件
  const { images, files } = useMemo(() => {
    return {
      images: resources.filter((resource) => resource.type.startsWith('image/')),
      files: resources.filter((resource) => !resource.type.startsWith('image/'))
    };
  }, [resources]);

  // 图片 URL 列表，用于预览
  const imageUrls = useMemo(() => {
    return images.map(image => `https://memos.erduoya.top/o/r/${image.id}`);
  }, [images]);

  // 处理图片点击，打开预览
  const handleImageClick = (index) => {
    setInitialIndex(index);
    setPreviewImages(imageUrls);
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
              onClick={() => handleImageClick(index)}
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

      {/* 图片预览 */}
      {showPreview && (
        <ImagePreview 
          images={previewImages}
          initialIndex={initialIndex}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
} 