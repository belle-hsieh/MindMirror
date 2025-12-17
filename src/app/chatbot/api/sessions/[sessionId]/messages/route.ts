import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { getGeminiModel } from '@/lib/gemini'

export async function GET(_: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { sessionId } = params
    // Ensure session belongs to user
    const { data: session, error: sErr } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()
    if (sErr || !session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return NextResponse.json({ messages: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { sessionId } = params
    const body = await request.json()
    const { content, system } = body as { content?: string; system?: string }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }
    // Ensure session belongs to user
    const { data: session, error: sErr } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()
    if (sErr || !session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Insert user message
    const { data: userMsg, error: uErr } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'user', content })
      .select()
      .single()
    if (uErr) throw uErr

    // Build context: latest messages
    const { data: prior } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(30)

    const model = getGeminiModel()
    const systemPrompt = system?.trim() || 'You are a helpful wellness journaling assistant.'

    const parts = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...(prior || []).map((m: any) => ({ role: m.role, parts: [{ text: m.content }] })),
    ] as any

    const res = await model.generateContent({ contents: parts })
    const text = res.response.text()

    const { data: assistantMsg, error: aErr } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'assistant', content: text })
      .select()
      .single()
    if (aErr) throw aErr

    return NextResponse.json({ messages: [userMsg, assistantMsg] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send message' }, { status: 500 })
  }
}
