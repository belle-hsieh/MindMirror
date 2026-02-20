'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    const redirectTo = searchParams.get('redirect')
    router.push(redirectTo || '/')
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
      <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
      <p className="text-sm text-gray-600 mb-6">Sign in to continue</p>
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
        <label className="block text-sm font-medium">
          Password
          <input
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-4 text-right">
        <Link className="text-sm text-blue-600 hover:text-blue-800 font-medium" href="/forgot-password">
          Forgot password?
        </Link>
      </div>
      <p className="mt-6 text-sm text-gray-600">
        New here?{' '}
        <Link className="text-black font-medium" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
