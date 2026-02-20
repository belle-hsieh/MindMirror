'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [origin, setOrigin] = useState<string>('')

  useEffect(() => {
    // Set origin only on client side (window is not available during SSR)
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!origin) {
      setError('Unable to determine app URL. Please refresh the page.')
      return
    }

    setLoading(true)

    try {
      // Send password reset email with redirect URL pointing to reset-password page
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${origin}/reset-password`,
        }
      )

      setLoading(false)

      if (resetError) {
        setError(resetError.message)
        return
      }

      setMessage('Check your email for password reset instructions.')
      setEmail('')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold mb-2">Reset your password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your email to receive a password reset link</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          Remember your password?{' '}
          <Link className="text-black font-medium" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
