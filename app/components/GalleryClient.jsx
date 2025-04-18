'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// 动态导入 ImagePreview 组件以优化客户端加载
const ImagePreview = dynamic(() => import('./ui/ImagePreview'), {
  ssr: false,
});

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day} `;
}

export default function Gallery({ images }) {
  const [showPreview, setShowPreview] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    // 提取所有图片的原始URL
    const urls = images.map(item => item.originalUrl || item.displayUrl);
    setImageUrls(urls);
  }, [images]);

  // 处理图片点击
  const handleImageClick = (index) => {
    setInitialIndex(index);
    setShowPreview(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* gallery-container: width: 100%; max-width: 1200px; margin: 0 auto; */}
      <div
        className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4"
        id="gallery"
      >
        {/* gallery: display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; */}
        {images.map((item, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-md cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            {/* gallery-item: position: relative; overflow: hidden; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */}
            <Image
              src={item.displayUrl}
              alt={item.file_name}
              width={200}
              height={200}
              className="w-full h-[200px] object-cover block"
            />
            {/* img: width: 100%; height: 200px; object-fit: cover; display: block; */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              {/* overlay: position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.5); color: white; padding: 0.5rem; text-align: center; opacity: 0; transition: opacity 0.3s; */}
              <p>{formatDate(item.last_modified)}</p>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-lg text-gray-600">
          {/* loading: text-align: center; padding: 2rem; font-size: 1.2rem; color: #666; */}
          无法加载图片，请稍后重试
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
    </div>
  );
}