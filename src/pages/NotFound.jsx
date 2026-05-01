import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__inner">
        <span className="notfound__code">404</span>
        <h1 className="notfound__title">Page not found</h1>
        <p className="notfound__sub">
          This page doesn't exist or may have been moved.
        </p>
        <Link to="/" className="btn btn--primary">
          Back to home
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
