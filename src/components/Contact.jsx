import { useState } from 'react'
import { motion } from 'motion/react'
import { useLanguage } from '../i18n/LanguageContext'
import FadeIn from './FadeIn'
import ContactButton from './ContactButton'

export default function Contact() {
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
      }
    } catch {
      setErrorMsg(t('contact.errorNetwork'))
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32" style={{ backgroundColor: 'var(--color-bg-dark)' }}>
      <div className={`max-w-5xl mx-auto ${!isHe ? 'ml-auto' : 'mr-auto'} w-full sm:w-4/5 md:w-3/5`}>
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

        <FadeIn delay={0.4} duration={0.8} y={30}>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div>
              <label className="block text-secondary font-medium mb-2 text-sm sm:text-base uppercase tracking-wide">
                {t('contact.labelName')} <span className="text-xs opacity-70 font-normal">(required)</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t('contact.placeholderName')}
                className="w-full border rounded-lg px-4 py-3 font-light transition-colors focus:outline-none"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-secondary font-medium mb-2 text-sm sm:text-base uppercase tracking-wide">
                {t('contact.labelEmail')} <span className="text-xs opacity-70 font-normal">(required)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t('contact.placeholderEmail')}
                className="w-full border rounded-lg px-4 py-3 font-light transition-colors focus:outline-none"
                required
              />
            </div>

            {/* Company Website */}
            <div>
              <label className="block text-secondary font-medium mb-2 text-sm sm:text-base uppercase tracking-wide">
                {t('contact.labelCompany')}
              </label>
              <input
                type="url"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder={t('contact.placeholderCompany')}
                className="w-full border rounded-lg px-4 py-3 font-light transition-colors focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-secondary font-medium mb-2 text-sm sm:text-base uppercase tracking-wide">
                {t('contact.labelPhone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t('contact.placeholderPhone')}
                className="w-full border rounded-lg px-4 py-3 font-light transition-colors focus:outline-none"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-secondary font-medium mb-2 text-sm sm:text-base uppercase tracking-wide">
                {t('contact.labelMessage')}
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t('contact.placeholderMessage')}
                rows="5"
                className="w-full bg-[#1a1a1a] border border-[#D7E2EA]/20 rounded-lg px-4 py-3 text-[#D7E2EA] placeholder-[#D7E2EA]/40 font-light focus:outline-none focus:border-[#D7E2EA]/60 transition-colors resize-none"
                required
              />
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
    </section>
  )
}
