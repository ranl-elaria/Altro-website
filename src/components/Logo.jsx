export default function Logo() {
  return (
    <div className="navbar__logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
      <svg className="logo__mark" width="32" height="32" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="7" fill="#3ECDC8" />
        <rect
          x="25"
          y="7"
          width="12"
          height="30"
          rx="6"
          fill="#3ECDC8"
          transform="rotate(20 31 22)"
        />
      </svg>
      <span className="logo__text">altro</span>
    </div>
  )
}
