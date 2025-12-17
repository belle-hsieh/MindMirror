import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ sessions: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch sessions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth()
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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: 500 })
  }
}
