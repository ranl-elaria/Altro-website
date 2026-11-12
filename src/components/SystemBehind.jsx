import { useState } from 'react'
import { useT } from '../i18n/LanguageContext'

export default function SystemBehind() {
  const t = useT()
  const tabs = ['01', '02', '03']
  const [on, setOn] = useState('01')

  return (
    <section className="system" id="system" aria-labelledby="system-heading">
      <div className="system__inner">
        <h2 id="system-heading" className="system__heading">{t('system.heading')}</h2>
        <p className="system__sub">{t('system.sub')}</p>
        <p className="system__note">{t('system.example')}</p>
        <div className="system__tabs" role="tablist" aria-label={t('system.heading')}>
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`system-tab-${id}`}
              aria-controls={`system-panel-${id}`}
              aria-selected={on === id}
              tabIndex={on === id ? 0 : -1}
              onClick={() => setOn(id)}
              onKeyDown={(e) => {
                const i = tabs.indexOf(id)
                if (e.key === 'ArrowLeft') setOn(tabs[(i + 1) % tabs.length])
                if (e.key === 'ArrowRight') setOn(tabs[(i - 1 + tabs.length) % tabs.length])
              }}
            >
              {t(`system.${id}.tab`)}
            </button>
          ))}
        </div>
        {tabs.map((id) => (
          <div
            key={id}
            className="system__panel"
            id={`system-panel-${id}`}
            role="tabpanel"
            aria-labelledby={`system-tab-${id}`}
            hidden={on !== id}
          >
            <h3>{t(`system.${id}.title`)}</h3>
            <p>{t(`system.${id}.text`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
