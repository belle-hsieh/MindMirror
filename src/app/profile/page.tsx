'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type UserState = {
  id: string
  email: string | null
  firstName?: string
  lastName?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserState | null>(null)
  const [loading, setLoading] = useState(true)

  const [newEmail, setNewEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'password'>('profile')

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const userData = data.user
      // Retrieve first/last name from user metadata stored in Supabase Auth
      const metadata = userData.user_metadata || {}
      setUser({
        id: userData.id,
        email: userData.email ?? null,
        firstName: metadata.first_name || '',
        lastName: metadata.last_name || '',
      })
      // Initialize form fields with current user data
      setNewEmail(userData.email ?? '')
      setFirstName(metadata.first_name || '')
      setLastName(metadata.last_name || '')
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleEmailChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailError(null)
    setEmailMessage(null)

    if (!newEmail || !newEmail.trim()) {
      setEmailError('Email is required')
      return
    }

    if (newEmail === user?.email) {
      setEmailError('New email must be different from current email')
      return
    }

    setEmailLoading(true)

    // Request email change - Supabase sends confirmation to both old and new email
    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    })

    setEmailLoading(false)

    if (error) {
      setEmailError(error.message)
      return
    }

    // User must confirm the new email by clicking link sent to inbox
    setEmailMessage('Confirmation link sent to your new email. Check your inbox.')
    setNewEmail('')
  }

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setPasswordLoading(true)

    // Verify current password is correct by attempting sign-in
    // This is needed because updatePassword() requires the user to be recently authenticated
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    })

    if (signInError) {
      setPasswordLoading(false)
      setPasswordError('Current password is incorrect')
      return
    }

    // Update password after verification succeeds
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setPasswordLoading(false)

    if (updateError) {
      setPasswordError(updateError.message)
      return
    }

    setPasswordMessage('Password updated successfully!')
    // Clear fields after successful update for security
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileError(null)
    setProfileMessage(null)
    setProfileLoading(true)

    try {
      // Store first/last name in Supabase user metadata (accessible via auth.getUser())
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      })

      if (error) {
        setProfileError(error.message)
        setProfileLoading(false)
        return
      }

      // Update local state to reflect changes in UI immediately
      setUser((prev) =>
        prev
          ? {
              ...prev,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
            }
          : null
      )

      setProfileMessage('Profile updated successfully!')
      setProfileLoading(false)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile')
      setProfileLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {/* User Info */}
        <div className="rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            {user.firstName || user.lastName ? (
              <p className="text-sm text-gray-600">
                Name: <span className="text-black font-medium">{user.firstName} {user.lastName}</span>
              </p>
            ) : null}
            <p className="text-sm text-gray-600">
              Email: <span className="text-black font-medium">{user.email}</span>
            </p>
            <p className="text-sm text-gray-600">
              User ID: <span className="text-black font-mono text-xs">{user.id}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'email'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Change Email
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 font-medium text-center transition-colors ${
                activeTab === 'password'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Change Password
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <label className="block text-sm font-medium">
                  First Name
                  <input
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Last Name
                  <input
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </label>
                {profileError && <p className="text-sm text-red-600">{profileError}</p>}
                {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}
                <button
                  className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
                  type="submit"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            )}

            {activeTab === 'email' && (
              <form onSubmit={handleEmailChange} className="space-y-4">
                <label className="block text-sm font-medium">
                  New Email
                  <input
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                    type="email"
                    autoComplete="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </label>
                {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                {emailMessage && <p className="text-sm text-green-600">{emailMessage}</p>}
                <button
                  className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
                  type="submit"
                  disabled={emailLoading}
                >
                  {emailLoading ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <label className="block text-sm font-medium">
                  Current Password
                  <input
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </label>
                <label className="block text-sm font-medium">
                  New Password
                  <input
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </label>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
                <button
                  className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-60"
                  type="submit"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link className="text-sm text-purple-600 hover:text-purple-800 font-medium" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
