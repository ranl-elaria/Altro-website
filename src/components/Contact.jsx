import { useState } from 'react'
import Logo from './Logo'

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

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
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <>
      <section className="contact section" id="contact">
        <div className="container">
          <div className="contact__layout">
            <div className="contact__header">
              <h2 className="display-heading display-heading--light">
                Ready to build something different?
              </h2>
              <p className="body-sub body-sub--light contact__sub">
                Tell us what you're working on and we'll get back to you within one business day.
              </p>

              <div className="contact__details">
                <div className="contact__detail">
                  <span className="contact__detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.5 12 19.79 19.79 0 011.21 3.28 2 2 0 013.22 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </span>
                  Response within one business day
                </div>
                <div className="contact__detail">
                  <span className="contact__detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </span>
                  No sales pitch — just a genuine conversation
                </div>
                <div className="contact__detail">
                  <span className="contact__detail-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  Free discovery call, no commitment needed
                </div>
              </div>
            </div>

            {status === 'success' ? (
              <div className="contact__success">
                <div className="contact__success-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Message sent</h3>
                <p>Thanks for reaching out. We'll be in touch within one business day.</p>
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label" htmlFor="company">Company</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      className="form-input"
                      placeholder="Your company"
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="message">What are you working on?</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    placeholder="Tell us about your project or the problem you're trying to solve..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {status === 'error' && (
                  <p className="contact__form-error">{errorMsg}</p>
                )}

                <div className="form-submit">
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? 'Sending…' : (
                      <>
                        Send message
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <Logo />
            <span className="footer__copy">© 2026 altro — all rights reserved</span>
            <nav className="footer__links">
              <a href="#services" className="footer__link">Services</a>
              <a href="#process" className="footer__link">Process</a>
              <a href="#contact" className="footer__link">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
