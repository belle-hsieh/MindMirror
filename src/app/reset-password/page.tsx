'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true)

        // Check for error in URL (sent by Supabase if recovery link expired or invalid)
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        if (errorParam) {
          setUrlError(errorDescription ? decodeURIComponent(errorDescription) : 'Invalid or expired reset link')
          setIsValidToken(false)
          setIsChecking(false)
          return
        }

        await new Promise(resolve => setTimeout(resolve, 500))

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          setUrlError('Authentication error. Your password reset link may have expired. Please request a new one.')
          setIsValidToken(false)
          setIsChecking(false)
          return
        }

        if (!user) {
          setUrlError('No valid session found. Your password reset link may have expired. Please request a new one.')
          setIsValidToken(false)
          setIsChecking(false)
          return
        }

        setIsValidToken(true)
        setIsChecking(false)
      } catch (err) {
        setUrlError('An error occurred. Please try again.')
        setIsValidToken(false)
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setMessage('Password updated successfully! You can now sign in with your new password.')
      setPassword('')
      setConfirmPassword('')
      
      await supabase.auth.signOut()
      
      setTimeout(() => router.push('/login'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
      setLoading(false)
    }
  }

  if (isChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!isValidToken) {
    const isExpired = urlError?.toLowerCase().includes('expired')
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-3xl font-semibold mb-2">
            {isExpired ? 'Link expired' : 'Invalid or expired link'}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {isExpired 
              ? 'Your password reset link has expired. Links are valid for 1 hour. Please request a new one.'
              : urlError || 'This password reset link is no longer valid.'}
          </p>
          <div className="space-y-3">
            <Link
              className="block w-full text-center rounded-lg bg-black text-white py-2 font-medium hover:bg-gray-800 transition-colors"
              href="/forgot-password"
            >
              {isExpired ? 'Request new reset link' : 'Try again'}
            </Link>
            <Link
              className="block w-full text-center rounded-lg border border-gray-300 text-black py-2 font-medium hover:bg-gray-50 transition-colors"
              href="/login"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-3xl font-semibold mb-2">Create new password</h1>
        <p className="text-sm text-gray-600 mb-6">Enter your new password below</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium">
            New Password
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>
          <label className="block text-sm font-medium">
            Confirm Password
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
        <p className="mt-6 text-sm text-gray-600">
          <Link className="text-black font-medium" href="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
