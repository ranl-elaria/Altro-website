import { useLanguage } from '../i18n/LanguageContext'

export default function LangSwitcher() {
  const { lang, switchLang } = useLanguage()

  return (
    <div className="lang-switcher" role="group" aria-label="Language selector">
      <button
        className={`lang-switcher__btn${lang === 'en' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => switchLang('en')}
        aria-pressed={lang === 'en'}
        lang="en"
      >
        EN
      </button>
      <span className="lang-switcher__sep" aria-hidden="true">/</span>
      <button
        className={`lang-switcher__btn${lang === 'he' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => switchLang('he')}
        aria-pressed={lang === 'he'}
        lang="he"
      >
        עב
      </button>
    </div>
  )
}
