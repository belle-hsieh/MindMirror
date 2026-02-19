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
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ entries: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { title, content } = body as { title?: string; content?: string }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    const finalTitle = title?.trim() || new Date().toISOString()

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: userId, title: finalTitle, content, updated_at: now })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ entry: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create entry' }, { status: 500 })
  }
}
