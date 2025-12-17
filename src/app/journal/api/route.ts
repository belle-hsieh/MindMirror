import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = auth()
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
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { title, content } = body as { title?: string; content?: string }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }
    const finalTitle = title?.trim() || new Date().toISOString()

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: userId, title: finalTitle, content })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ entry: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create entry' }, { status: 500 })
  }
}
