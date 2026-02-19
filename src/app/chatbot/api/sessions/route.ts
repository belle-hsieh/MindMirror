import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ sessions: data ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch sessions'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const title: string = body?.title || 'New Chat'
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, title })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ session: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
