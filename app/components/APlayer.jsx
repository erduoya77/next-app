'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

export default function APlayer({ audio }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.APlayer && containerRef.current) {
      playerRef.current = new window.APlayer({
        container: containerRef.current,
        mini: false,
        autoplay: false,
        theme: '#b7daff',
        loop: 'all',
        order: 'list',
        preload: 'auto',
        volume: 0.7,
        mutex: true,
        listFolded: false,
        listMaxHeight: '200px',
        audio: audio
      })

      return () => {
        if (playerRef.current) {
          playerRef.current.destroy()
        }
      }
    }
  }, [audio])

  return (
    <>
      <Script 
        src="/js/APlayer.min.js"
        strategy="lazyOnload"
      />
      <div ref={containerRef} className="aplayer" />
    </>
  )
} 