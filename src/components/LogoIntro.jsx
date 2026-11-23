import { useEffect } from 'react'

export default function LogoIntro() {
  useEffect(() => {
    window.dispatchEvent(new Event('altro:app-ready'))
  }, [])

  return null
}
