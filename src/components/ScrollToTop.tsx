import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Force scroll to top with multiple methods for cross-browser compatibility
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [pathname])

  return null
}
