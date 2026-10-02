import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { useLanguage } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'

export default function Contact({ isModal = false, onSubmitSuccess, headingId }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const { t, lang } = useLanguage()
  const isHe = lang === 'he'

  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const messageId = useId()
  const statusId = useId()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      // Capture attribution: UTM params from URL + referrer + cookies set by analytics
      const url = new URL(window.location.href)
      const cookieGet = (k) => {
        const m = document.cookie.match(new RegExp('(?:^|; )' + k + '=([^;]*)'))
        return m ? decodeURIComponent(m[1]) : null
      }
      const attribution = {
        utm_source:   url.searchParams.get('utm_source')   || cookieGet('utm_source'),
        utm_medium:   url.searchParams.get('utm_medium')   || cookieGet('utm_medium'),
        utm_campaign: url.searchParams.get('utm_campaign') || cookieGet('utm_campaign'),
        utm_content:  url.searchParams.get('utm_content')  || cookieGet('utm_content'),
        utm_term:     url.searchParams.get('utm_term')     || cookieGet('utm_term'),
        referrer: document.referrer || null,
        landing_path: url.pathname,
      }
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.phone.trim() ? `${form.message}\n\nPhone / WhatsApp: ${form.phone.trim()}` : form.message,
          attribution,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? t('contact.errorDefault'))
        setStatus('error')
      } else {
        setStatus('success')
        setForm({ name: '', email: '', phone: '', message: '' })
        if (onSubmitSuccess) onSubmitSuccess()
      }
    } catch {
      setErrorMsg(t('contact.errorNetwork'))
      setStatus('error')
    }
  }

  const field = (id, name, type, label, ph, req, extra = {}) => (
    <div className="form2__field">
      <label htmlFor={id} className="form2__label">
        {label} {req ? <span className="form2__req">{t('contact.required')}</span> : <span className="form2__opt">{t('contact.optional')}</span>}
      </label>
      <input id={id} type={type} name={name} value={form[name]} onChange={handleChange} placeholder={ph}
        className="form2__input" required={req} aria-required={req ? 'true' : undefined} {...extra} />
    </div>
  )

  const formEl = (
    <form onSubmit={handleSubmit} className="form2" noValidate={false}>
      {field(nameId, 'name', 'text', t('contact.labelName'), t('contact.placeholderName'), true, { autoComplete: 'name' })}
      <div className="form2__row">
        {field(phoneId, 'phone', 'tel', t('contact.labelPhone'), t('contact.placeholderPhone'), false, { autoComplete: 'tel', dir: 'ltr' })}
        {field(emailId, 'email', 'email', t('contact.labelEmail'), t('contact.placeholderEmail'), true, { autoComplete: 'email', dir: 'ltr' })}
      </div>
      <div className="form2__field">
        <label htmlFor={messageId} className="form2__label">
          {t('contact.labelMessage')} <span className="form2__req">{t('contact.required')}</span>
        </label>
        <textarea id={messageId} name="message" value={form.message} onChange={handleChange}
          placeholder={t('contact.placeholderMessage')} rows="4" className="form2__input form2__textarea" required aria-required="true" />
      </div>

      <div id={statusId} aria-live="polite" aria-atomic="true">
        {status === 'error' && <div className="form2__msg form2__msg--error" role="alert">{errorMsg}</div>}
        {status === 'success' && <div className="form2__msg form2__msg--ok" role="status">{t('contact.successTitle')} {t('contact.successBody')}</div>}
      </div>

      <div className="form2__actions">
        <button type="submit" className="btn btn--amber" disabled={status === 'loading'} aria-describedby={statusId}>
          {status === 'loading' ? t('contact.submitting') : t('contact.submit')}
        </button>
        <p className="form2__hint">{t('contact.ctaHint')}</p>
      </div>
    </form>
  )

  if (isModal) {
    return (
      <div id="contact-modal-form" className="form2--modal">
        <h2 id={headingId} className="form2__modal-heading">{t('contact.heading')}</h2>
        {formEl}
      </div>
    )
  }

  return (
    <section id="contact" className="closing2">
      <div className="closing2__inner">
        <FadeIn delay={0} duration={0.8} y={32}>
          <h2 className="closing2__heading">{t('contact.heading')}</h2>
          <p className="closing2__sub">{t('contact.sub')}</p>
        </FadeIn>
        <FadeIn delay={0.15} duration={0.8} y={32}>
          <div className="closing2__card">{formEl}</div>
        </FadeIn>
      </div>
    </section>
  )
}
