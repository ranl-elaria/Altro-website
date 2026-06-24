export default function ContactButton({ children = 'Contact Me', onClick, type = 'button', disabled = false, size = 'md', centered = false }) {
  const sizeClass = size === '2xl'
    ? 'px-16 py-6 sm:px-20 sm:py-7 text-lg sm:text-xl md:text-2xl'
    : size === 'xl'
    ? 'px-12 py-5 sm:px-16 sm:py-6 text-base sm:text-lg md:text-xl'
    : size === 'lg'
    ? 'px-10 py-4 sm:px-14 sm:py-5 text-sm sm:text-base md:text-lg'
    : 'px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-2xl ${sizeClass}
        font-bold uppercase tracking-wider
        text-white
        relative
        transition-all duration-400
        hover:scale-110 hover:-translate-y-1
        active:scale-95 active:translate-y-0
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 disabled:active:translate-y-0
        overflow-hidden group
      `}
      style={{
        background: 'var(--color-accent)',
        boxShadow: `
          0px 20px 50px rgb(12 182 177 / 0.5),
          0px 8px 20px rgb(12 182 177 / 0.35),
          0px 2px 8px rgb(12 182 177 / 0.25),
          inset 2px 2px 4px rgba(255, 255, 255, 0.25),
          inset -2px -2px 4px rgba(0, 0, 0, 0.15)
        `,
        outline: 'none',
      }}
    >
      {children}
    </button>
  )
}
