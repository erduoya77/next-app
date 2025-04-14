'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function ImagePreview({ 
  images = [], 
  initialIndex = 0,
  onClose, 
  showNavigation = true,
  className = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 计算当前图片
  const currentImage = useMemo(() => {
    return images[currentIndex] || null;
  }, [images, currentIndex]);

  // 客户端渲染处理
  useEffect(() => {
    setMounted(true);
    
    // 动画效果，组件挂载后显示
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  // 键盘事件处理
  useEffect(() => {
    const handleKeydown = (e) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // 处理关闭
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  // 处理前一张图片
  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsLoaded(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 处理下一张图片
  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setIsLoaded(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // 背景点击处理
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!currentImage || !mounted) return null;

  // 创建预览内容
  const previewContent = (
    <div 
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      onClick={handleBackdropClick}
    >
      {/* 关闭按钮 */}
      <button 
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-[1000]"
        onClick={handleClose}
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      
      {/* 控制导航 */}
      {showNavigation && images.length > 1 && (
        <>
          <button 
            className={`absolute left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-[1000] ${
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          
          <button 
            className={`absolute right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-[1000] ${
              currentIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
          >
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </>
      )}
      
      {/* 图片计数器 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      
      {/* 加载指示器 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* 图片容器 */}
      <div 
        className={`relative transition-opacity duration-300 max-w-[90vw] max-h-[90vh] ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Image
          src={currentImage}
          alt={`Image Preview ${currentIndex + 1}`}
          width={1200}
          height={900}
          quality={85}
          className="object-contain max-h-[90vh] max-w-[90vw] rounded-lg"
          onLoad={handleImageLoad}
          priority
        />
      </div>
    </div>
  );

  // 使用 createPortal 将组件渲染到 document.body
  return createPortal(previewContent, document.body);
} 