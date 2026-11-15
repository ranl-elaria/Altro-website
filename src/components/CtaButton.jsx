export default function CtaButton({
  children,
  onClick,
  type = 'button',
  className = '',
  href,
  disabled = false,
  variant = 'fill',
}) {
  const cls = `cta${variant === 'outline' ? ' cta--outline' : ''}${className ? ` ${className}` : ''}`
  const inner = (
    <>
      <span className="cta__fill" aria-hidden="true" />
      <span className="cta__label">{children}</span>
      <span className="cta__arrow" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M10 3 4 8l6 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  )

  if (href) {
    return (
      <a className={cls} href={href} onClick={onClick}>
        {inner}
      </a>
    )
  }

  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} aria-busy={disabled || undefined}>
      {inner}
    </button>
  )
}
