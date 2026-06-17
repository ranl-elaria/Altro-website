export default function ContactButton({ children = 'Contact Me', onClick, type = 'button', disabled = false, size = 'md' }) {
  const sizeClass = size === 'lg'
    ? 'px-10 py-4 sm:px-14 sm:py-5 text-sm sm:text-base md:text-lg'
    : 'px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base'

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full ${sizeClass}
        font-medium uppercase tracking-widest
        text-white
        relative
        transition-all duration-200
        hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
      `}
      style={{
        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow: `
          0px 4px 12px rgba(181, 1, 167, 0.35),
          inset 4px 4px 12px #7721B1,
          inset -2px -2px 0px white
        `,
        outline: '2px solid white',
        outlineOffset: '-3px',
      }}
    >
      {children}
    </button>
  )
}
