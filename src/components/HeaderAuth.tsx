'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type UserState = {
  id: string
  email: string | null
}

export default function HeaderAuth() {
  const router = useRouter()
  const [user, setUser] = useState<UserState | null>(null)

  useEffect(() => {
    const readSession = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUser({ id: data.user.id, email: data.user.email ?? null })
      else setUser(null)
    }

    readSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser({ id: session.user.id, email: session.user.email ?? null })
      else setUser(null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 relative z-10">
      {!user ? (
        <>
          <Link className="text-sm sm:text-base font-medium" href="/login">
            Sign In
          </Link>
          <Link
            className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer flex items-center"
            href="/signup"
          >
            Sign Up
          </Link>
        </>
      ) : (
        <>
          <Link
            className="text-sm sm:text-base font-medium text-gray-700 hover:text-gray-900"
            href="/profile"
          >
            {user.email ?? 'Profile'}
          </Link>
          <button
            className="text-sm sm:text-base font-medium"
            onClick={handleSignOut}
            type="button"
          >
            Sign Out
          </button>
        </>
      )}
    </header>
  )
}
