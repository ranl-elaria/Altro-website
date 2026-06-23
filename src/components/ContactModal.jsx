import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useContactModal } from '../context/ContactModalContext'
import { useLanguage } from '../i18n/LanguageContext'
import Contact from './Contact'

export default function ContactModal() {
  const { isOpen, closeModal } = useContactModal()
  const { lang } = useLanguage()
  const [showSuccess, setShowSuccess] = useState(false)

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal content */}
          <motion.div
            className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[32px] sm:rounded-[48px] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800/50"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 sm:top-8 sm:right-8 z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Success message overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[32px] sm:rounded-[48px] flex flex-col items-center justify-center z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <svg
                      className="w-16 h-16 text-teal-500 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-center px-6"
                  >
                    <h3 className="text-2xl font-black text-white mb-2">Message sent</h3>
                    <p className="text-gray-400 text-sm">
                      Thanks for reaching out. We'll be in touch within one business day.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form content */}
            <Contact isModal={true} onSubmitSuccess={handleSubmitSuccess} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
