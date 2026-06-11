import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { TRANSLATIONS } from './translations'

const STORAGE_KEY = 'altro_lang'
const SUPPORTED = ['en', 'he']
const DEFAULT = 'en'

function syncHtml(lang) {
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr')
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED.includes(saved)) {
      syncHtml(saved)
      return saved
    }
    syncHtml(DEFAULT)
    return DEFAULT
  })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED.includes(saved)) return

    fetch('https://ipapi.co/country/', { signal: AbortSignal.timeout(3000) })
      .then(r => r.text())
      .then(code => {
        const detected = code.trim() === 'IL' ? 'he' : 'en'
        localStorage.setItem(STORAGE_KEY, detected)
        setLang(detected)
        syncHtml(detected)
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
