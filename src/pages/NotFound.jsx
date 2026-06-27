import { Link } from 'react-router-dom'
import { useT } from '../i18n/LanguageContext'

export default function NotFound() {
  const t = useT()

  return (
    <div className="notfound">
      <div className="notfound__inner">
        <span className="notfound__code">404</span>
        <h1 className="notfound__title">{t('notFound.title')}</h1>
        <p className="notfound__sub">{t('notFound.sub')}</p>
        <Link to="/" className="btn btn--primary">
          {t('notFound.back')}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
