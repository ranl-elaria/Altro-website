import { useContactModal } from '../context/ContactModalContext'
import { useT } from '../i18n/LanguageContext'

export default function ContactCTA({ label, variant = 'primary', className = '' }) {
  const { openModal } = useContactModal()
  const t = useT()

  const buttonLabel = label || t('contact.submit')

  const baseClasses = 'px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold uppercase tracking-wide transition-all duration-200 cursor-pointer inline-block active:scale-95'

  const variantClasses = {
    primary: 'text-white',
    secondary: '',
    ghost: '',
  }

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-accent)',
    },
    secondary: {
      borderWidth: '2px',
      borderColor: 'var(--color-accent)',
      color: 'var(--color-accent)',
    },
    ghost: {
      color: 'var(--color-accent)',
    },
  }

  return (
    <button
      onClick={openModal}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={variantStyles[variant]}
      onMouseEnter={(e) => {
        if (variant === 'primary') e.target.style.backgroundColor = 'var(--color-accent-bright)'
        else e.target.style.backgroundColor = 'rgba(12, 182, 177, 0.1)'
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = variantStyles[variant].backgroundColor || ''
      }}
      type="button"
    >
      {buttonLabel}
    </button>
  )
}
