import { Link, useLocation } from 'react-router-dom'
import { useLanguage, useT } from '../i18n/LanguageContext'

function isPreviewPath(pathname) {
  return pathname === '/preview' || pathname.startsWith('/preview/') || pathname === '/he/preview' || pathname.startsWith('/he/preview/')
}

function isOverstoryPath(pathname) {
  return pathname === '/overstory' || pathname.startsWith('/overstory/') || pathname === '/he/overstory' || pathname.startsWith('/he/overstory/')
}

export default function LangSwitcher() {
  const { lang } = useLanguage()
  const t = useT()
  const { pathname } = useLocation()
  const preview = isPreviewPath(pathname)
  const overstory = isOverstoryPath(pathname)
  const enTo = preview ? '/preview' : overstory ? '/overstory' : '/'
  const heTo = preview ? '/he/preview' : overstory ? '/he/overstory' : '/he/'

  return (
    <div className="lang-switcher" role="group" aria-label={t('a11y.langSelector')}>
      <Link
        to={enTo}
        hrefLang="en"
        lang="en"
        className={`lang-switcher__btn${lang === 'en' ? ' lang-switcher__btn--active' : ''}`}
        aria-current={lang === 'en' ? 'page' : undefined}
      >
        EN
      </Link>
      <span className="lang-switcher__sep" aria-hidden="true">/</span>
      <Link
        to={heTo}
        hrefLang="he"
        lang="he"
        className={`lang-switcher__btn${lang === 'he' ? ' lang-switcher__btn--active' : ''}`}
        aria-current={lang === 'he' ? 'page' : undefined}
      >
        עב
      </Link>
    </div>
  )
}
