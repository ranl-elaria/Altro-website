import { useContactModal } from '../context/ContactModalContext'
import { useT } from '../i18n/LanguageContext'

export default function ContactCTA({ label, variant = 'primary', className = '' }) {
  const { openModal } = useContactModal()
  const t = useT()

  const buttonLabel = label || t('contact.submit')

  const baseStyles = 'px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer inline-block'

  const variantStyles = {
    primary: 'bg-teal-500 text-white hover:bg-teal-600 active:scale-95',
    secondary: 'border-2 border-teal-500 text-teal-500 hover:bg-teal-500/10 active:scale-95',
    ghost: 'text-teal-500 hover:bg-teal-500/10 active:scale-95',
  }

  return (
    <button
      onClick={openModal}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      type="button"
    >
      {buttonLabel}
    </button>
  )
}
