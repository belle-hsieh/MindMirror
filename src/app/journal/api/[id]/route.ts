import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { cookies } from 'next/headers'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = params
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return NextResponse.json({ entry: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch entry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = params
    const body = await request.json()
    const { title, content } = body as { title?: string; content?: string }
    const updates: Record<string, string> = {}
    if (typeof title === 'string') updates.title = title
    if (typeof content === 'string') updates.content = content
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ entry: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update entry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = params
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete entry'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
