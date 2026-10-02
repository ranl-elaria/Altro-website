import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { ContactModalProvider } from './context/ContactModalContext'
import { Site } from './App.jsx'

// Build-time prerender of the homepage body for one language (see scripts/prerender.mjs).
export function render(lang) {
  return renderToString(
    <LanguageProvider initialLang={lang}>
      <StaticRouter location={lang === 'he' ? '/he/' : '/'}>
        <ContactModalProvider>
          <Site />
        </ContactModalProvider>
      </StaticRouter>
    </LanguageProvider>,
  )
}
