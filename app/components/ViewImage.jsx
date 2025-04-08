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
        cursor: zoom-out;
      `

      const image = document.createElement('img')
      image.src = img.src
      image.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transition: transform 0.3s;
      `

      wrapper.appendChild(image)
      document.body.appendChild(wrapper)

      wrapper.addEventListener('click', () => {
        wrapper.style.opacity = '0'
        setTimeout(() => wrapper.remove(), 300)
      })
    }

    document.addEventListener('click', handleImageClick)
    return () => document.removeEventListener('click', handleImageClick)
  }, [])

  return null
} 