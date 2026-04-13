import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Logo from './Logo'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError('Invalid email or password.')
    setLoading(false)
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">
          <Logo />
        </div>
        <h1 className="admin-login__title">Admin</h1>
        <p className="admin-login__sub">Sign in to view submissions</p>

        <form className="admin-login__form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label admin-form-label" htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              className="form-input admin-form-input"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-field">
            <label className="form-label admin-form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              className="form-input admin-form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="admin-login__error">{error}</p>}

          <button
            type="submit"
            className="btn btn--primary admin-login__submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
