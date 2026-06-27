import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { TRANSLATIONS } from './translations'

const STORAGE_KEY = 'altro_lang'
const SUPPORTED = ['en', 'he']
const DEFAULT = 'en'

function syncHtml(lang) {
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr')
}

function detectFromUrl() {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname
  if (path === '/he' || path.startsWith('/he/')) return 'he'
  return null
}

function updateDocumentMeta(lang) {
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? key
  const title = t('meta.title')
  const description = t('meta.description')
  const url = lang === 'he' ? 'https://altro.build/he/' : 'https://altro.build/'

  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Priority: URL path → localStorage → default. IP geo runs only if none of those resolved.
    const fromUrl = detectFromUrl()
    if (fromUrl) {
      syncHtml(fromUrl)
      updateDocumentMeta(fromUrl)
      return fromUrl
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED.includes(saved)) {
      syncHtml(saved)
      updateDocumentMeta(saved)
      return saved
    }
    syncHtml(DEFAULT)
    updateDocumentMeta(DEFAULT)
    return DEFAULT
  })

  useEffect(() => {
    // Skip IP detection when URL or storage already picked a language.
    if (detectFromUrl()) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED.includes(saved)) return

    fetch('https://ipapi.co/country/', { signal: AbortSignal.timeout(3000) })
      .then(r => r.text())
      .then(code => {
        const detected = code.trim() === 'IL' ? 'he' : 'en'
        localStorage.setItem(STORAGE_KEY, detected)
        setLang(detected)
        syncHtml(detected)
        updateDocumentMeta(detected)
      })
      .catch(() => {
        localStorage.setItem(STORAGE_KEY, DEFAULT)
      })
  }, [])

  const switchLang = useCallback((newLang) => {
    if (!SUPPORTED.includes(newLang)) return
    localStorage.setItem(STORAGE_KEY, newLang)
    setLang(newLang)
    syncHtml(newLang)
    updateDocumentMeta(newLang)
  }, [])

  const t = useCallback(
    (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS[DEFAULT]?.[key] ?? key,
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useT() {
  return useContext(LanguageContext).t
}
