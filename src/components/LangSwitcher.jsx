import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function LangSwitcher() {
  const { lang } = useLanguage()
  const navigate = useNavigate()

  const handleLangChange = (newLang) => {
    navigate(newLang === 'he' ? '/he/' : '/')
  }

  return (
    <div className="lang-switcher" role="group" aria-label="Language selector">
      <button
        className={`lang-switcher__btn${lang === 'en' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => handleLangChange('en')}
        aria-pressed={lang === 'en'}
        lang="en"
      >
        EN
      </button>
      <span className="lang-switcher__sep" aria-hidden="true">/</span>
      <button
        className={`lang-switcher__btn${lang === 'he' ? ' lang-switcher__btn--active' : ''}`}
        onClick={() => handleLangChange('he')}
        aria-pressed={lang === 'he'}
        lang="he"
      >
        עב
      </button>
    </div>
  )
}
