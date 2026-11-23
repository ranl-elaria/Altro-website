import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useContactModal } from '../context/ContactModalContext'
import { useT } from '../i18n/LanguageContext'
import Contact from './Contact'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function ContactModal() {
  const { isOpen, closeModal } = useContactModal()
  const t = useT()
  const reduce = useReducedMotion()
  const [showSuccess, setShowSuccess] = useState(false)
  const dialogRef = useRef(null)
  const previouslyFocused = useRef(null)

  const handleClose = () => {
    setShowSuccess(false)
    closeModal()
  }

  const handleSubmitSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      closeModal()
    }, 2400)
  }

  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handleClose()
        return
      }
      if (e.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusables = dialog.querySelectorAll(FOCUSABLE)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKey)

    requestAnimationFrame(() => {
      const dialog = dialogRef.current
      if (!dialog) return
      const heading = dialog.querySelector('#contact-modal-heading')
      if (heading) heading.setAttribute('tabindex', '-1')
      const focusables = dialog.querySelectorAll(FOCUSABLE)
      if (focusables.length > 0) focusables[0].focus()
    })

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
      if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
        previouslyFocused.current.focus()
      }
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="contact-modal"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="contact-modal__backdrop"
            onClick={handleClose}
            aria-label={t('a11y.closeModal')}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-heading"
            className="contact-modal__panel"
            initial={reduce ? false : { y: 16 }}
            animate={{ y: 0 }}
            exit={reduce ? undefined : { y: 16 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="contact-modal__close"
              aria-label={t('a11y.closeModal')}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="contact-modal__success"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  role="status"
                  aria-live="polite"
                >
                  <h3>{t('contact.successTitle')}</h3>
                  <p>{t('contact.successBody')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Contact isModal={true} onSubmitSuccess={handleSubmitSuccess} headingId="contact-modal-heading" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
