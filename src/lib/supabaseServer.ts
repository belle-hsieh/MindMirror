import { createServerClient } from '@supabase/ssr'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createSupabaseServerClient = (cookieStore: ReadonlyRequestCookies) =>
  createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Ignore if called from a read-only context.
        }
      },
      remove: (name, options) => {
        try {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 })
        } catch {
          // Ignore if called from a read-only context.
        }
      },
    },
  })
