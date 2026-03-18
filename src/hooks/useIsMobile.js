import { useState, useEffect } from 'react'

export default function useIsMobile() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  useEffect(() => {
    let raf = 0
    function onResize() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setSize({ width: window.innerWidth, height: window.innerHeight })
      })
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return {
    isMobile: size.width < 640,
    isTablet: size.width >= 640 && size.width < 1024,
    width: size.width,
    height: size.height,
  }
}
