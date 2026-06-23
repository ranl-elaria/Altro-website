import { useState } from 'react'
import { motion } from 'motion/react'
import { useLanguage } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

export default function Contact({ isModal = false, onSubmitSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const { t, lang } = useLanguage()
  const isHe = lang === 'he'

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? t('contact.errorDefault'))
        setStatus('error')
      } else {
        setStatus('success')
        setForm({ name: '', email: '', company: '', phone: '', message: '' })
        if (onSubmitSuccess) onSubmitSuccess()
      }
    } catch {
      setErrorMsg(t('contact.errorNetwork'))
      setStatus('error')
    }
  }

  const containerClass = isModal
    ? 'px-6 sm:px-10 py-10 sm:py-12 w-full'
    : 'px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32'

  return (
    <div id="contact" className={isModal ? undefined : 'section--light'} style={isModal ? { background: '#ffffff' } : undefined}>
      <div className={`${containerClass} ${isModal ? '' : 'max-w-5xl mx-auto w-full sm:w-4/5 md:w-3/5'}`}>
        {!isModal && (
          <>
            <FadeIn delay={0} duration={0.8} y={40}>
              <h2 className="hero-heading font-black uppercase tracking-tight leading-none text-center mb-4 sm:mb-6" style={{ fontSize: 'clamp(2rem, 8vw, 100px)', textWrap: 'balance' }}>
                {t('contact.heading')}
              </h2>
            </FadeIn>

            <FadeIn delay={0.2} duration={0.8} y={20}>
              <p className="text-secondary font-light leading-relaxed text-center mb-12 sm:mb-16 opacity-80" style={{ fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)' }}>
                {t('contact.sub')}
              </p>
            </FadeIn>
          </>
        )}

        {isModal && (
          <h2 className="font-black uppercase tracking-tight leading-none text-center mb-10 text-white" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', color: '#0CB6B1' }}>
            {t('contact.heading')}
          </h2>
        )}

        <FadeIn delay={isModal ? 0 : 0.4} duration={0.8} y={30}>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div>
              <label className={`block font-medium mb-2 text-sm sm:text-base uppercase tracking-wide ${isModal ? 'text-gray-200' : 'text-secondary'}`}>
                {t('contact.labelName')} <span className={`text-xs opacity-70 font-normal ${isModal ? 'text-gray-400' : ''}`}>(required)</span>
              </label>
              <div className="form-input-wrap">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('contact.placeholderName')}
                  className="form-input w-full"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block font-medium mb-2 text-sm sm:text-base uppercase tracking-wide ${isModal ? 'text-gray-200' : 'text-secondary'}`}>
                {t('contact.labelEmail')} <span className={`text-xs opacity-70 font-normal ${isModal ? 'text-gray-400' : ''}`}>(required)</span>
              </label>
              <div className="form-input-wrap">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('contact.placeholderEmail')}
                  className="form-input w-full"
                  required
                />
              </div>
            </div>

            {/* Company Website */}
            <div>
              <label className={`block font-medium mb-2 text-sm sm:text-base uppercase tracking-wide ${isModal ? 'text-gray-200' : 'text-secondary'}`}>
                {t('contact.labelCompany')}
              </label>
              <div className="form-input-wrap">
                <input
                  type="url"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder={t('contact.placeholderCompany')}
                  className="form-input w-full"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={`block font-medium mb-2 text-sm sm:text-base uppercase tracking-wide ${isModal ? 'text-gray-200' : 'text-secondary'}`}>
                {t('contact.labelPhone')}
              </label>
              <div className="form-input-wrap">
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder={t('contact.placeholderPhone')}
                  className="form-input w-full"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className={`block font-medium mb-2 text-sm sm:text-base uppercase tracking-wide ${isModal ? 'text-gray-200' : 'text-secondary'}`}>
                {t('contact.labelMessage')}
              </label>
              <div className="form-input-wrap">
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('contact.placeholderMessage')}
                  rows="5"
                  className="form-textarea w-full"
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm"
              >
                {errorMsg}
              </motion.div>
            )}

            {/* Success message */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-3 text-green-300 text-sm"
              >
                {t('contact.successTitle')} — {t('contact.successBody')}
              </motion.div>
            )}

            {/* Submit button */}
            <div className="flex flex-col gap-2 pt-4">
              <ContactButton type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? t('contact.submitting') : t('contact.submit')}
              </ContactButton>
              <p className="text-secondary text-xs sm:text-sm font-light opacity-70 text-center">
                {t('contact.ctaHint')}
              </p>
            </div>
          </form>
        </FadeIn>
      </div>
    </div>
  )
}
