'use client'

import { useEffect } from 'react'

export default function ViewImage() {
  useEffect(() => {
    const handleImageClick = (e) => {
      const img = e.target
      if (img.tagName !== 'IMG' || img.hasAttribute('no-view')) return
      e.preventDefault()

      const wrapper = document.createElement('div')
      wrapper.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s;
        background: rgba(0, 0, 0, 0.85);
        touch-action: none;
        overflow: hidden;
      `

      const imageContainer = document.createElement('div')
      imageContainer.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      `

      const image = document.createElement('img')
      image.src = img.src
      image.style.cssText = `
        max-width: 90%;
        max-height: 80vh;
        width: auto;
        height: auto;
        object-fit: contain;
        transition: transform 0.3s;
        touch-action: none;
        transform-origin: center;
        will-change: transform;
        position: relative;
      `

      let scale = 1
      let startDistance = 0
      let lastScale = 1
      let isDragging = false
      let startX = 0
      let startY = 0
      let translateX = 0
      let translateY = 0

      const resetTransform = () => {
        scale = 1
        translateX = 0
        translateY = 0
        updateTransform()
      }

      const updateTransform = () => {
        if (scale <= 1) {
          translateX = 0
          translateY = 0
        } else {
          // 计算边界限制
          const maxTranslateX = Math.max(0, (scale * image.offsetWidth - window.innerWidth) / 2)
          const maxTranslateY = Math.max(0, (scale * image.offsetHeight - window.innerHeight) / 2)

          // 限制拖动范围
          translateX = Math.min(Math.max(translateX, -maxTranslateX), maxTranslateX)
          translateY = Math.min(Math.max(translateY, -maxTranslateY), maxTranslateY)
        }

        image.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
      }

      // 处理触摸缩放和拖动
      const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
          e.preventDefault()
          startDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          )
          lastScale = scale
        } else if (e.touches.length === 1) {
          isDragging = true
          startX = e.touches[0].pageX - translateX
          startY = e.touches[0].pageY - translateY
        }
      }

      const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
          e.preventDefault()
          const currentDistance = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          )
          const newScale = lastScale * (currentDistance / startDistance)
          scale = Math.min(Math.max(newScale, 0.5), 3)
          updateTransform()
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
          e.preventDefault()
          translateX = e.touches[0].pageX - startX
          translateY = e.touches[0].pageY - startY
          updateTransform()
        }
      }

      const handleTouchEnd = () => {
        isDragging = false
        if (scale <= 1) {
          resetTransform()
        }
      }

      // 处理点击关闭
      const handleWrapperClick = (e) => {
        if (e.target === wrapper || e.target === imageContainer) {
          wrapper.style.opacity = '0'
          setTimeout(() => wrapper.remove(), 300)
        }
      }

      // 双击重置
      let lastTap = 0
      const handleDoubleTap = (e) => {
        const currentTime = new Date().getTime()
        const tapLength = currentTime - lastTap
        if (tapLength < 300 && tapLength > 0) {
          e.preventDefault()
          resetTransform()
        }
        lastTap = currentTime
      }

      image.addEventListener('touchstart', handleTouchStart)
      image.addEventListener('touchmove', handleTouchMove, { passive: false })
      image.addEventListener('touchend', handleTouchEnd)
      image.addEventListener('touchend', handleDoubleTap)
      wrapper.addEventListener('click', handleWrapperClick)

      imageContainer.appendChild(image)
      wrapper.appendChild(imageContainer)
      document.body.appendChild(wrapper)
    }

    document.addEventListener('click', handleImageClick)
    return () => document.removeEventListener('click', handleImageClick)
  }, [])

  return null
} 