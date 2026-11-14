import { Link } from 'react-router-dom'
import { useLanguage, useT } from '../i18n/LanguageContext'

export default function LangSwitcher() {
  const { lang } = useLanguage()
  const t = useT()

  return (
    <div className="lang-switcher" role="group" aria-label={t('a11y.langSelector')}>
      <Link
        to="/"
        hrefLang="en"
        lang="en"
        className={`lang-switcher__btn${lang === 'en' ? ' lang-switcher__btn--active' : ''}`}
        aria-current={lang === 'en' ? 'page' : undefined}
      >
        EN
      </Link>
      <span className="lang-switcher__sep" aria-hidden="true">/</span>
      <Link
        to="/he/"
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
