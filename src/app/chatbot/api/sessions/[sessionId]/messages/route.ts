import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServer'
import { generateGeminiContent } from '@/lib/gemini'
import { cookies } from 'next/headers'

export async function GET(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { sessionId } = await params
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch messages'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    // Authenticate user and extract session ID from URL params
    const cookieStore = await cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { sessionId } = await params
    
    // Validate request body
    const body = await request.json()
    const { content } = body as { content?: string }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'content required' }, { status: 400 })
    }
    
    // Verify this chat session belongs to the authenticated user (security check)
    const { data: session, error: sErr } = await supabase
      .from('chat_sessions')
      .select('id, title')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()
    if (sErr || !session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Store user's message in the database
    const { data: userMsg, error: uErr } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'user', content })
      .select()
      .single()
    if (uErr) throw uErr

    // Fetch conversation history (up to 30 recent messages) to provide context to Gemini
    const { data: prior } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(30)

    // System prompt defines the AI's behavior and role
    const systemPrompt = 'You are a helpful wellness journaling assistant.'

    // Format conversation history for Gemini API (system message + prior messages)
    const parts = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...(prior || []).map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    ]

    // Call Gemini to generate AI response based on conversation history
    const { text } = await generateGeminiContent(parts)

    if (!session.title || session.title === 'New Chat') {
      try {
        const titlePrompt = `Create a short title (max 6 words) for this chat based on the first user message. Return only the title.`
        const { text: titleRaw } = await generateGeminiContent([
          { role: 'user', parts: [{ text: titlePrompt }] },
          { role: 'user', parts: [{ text: content }] },
        ])
        const titleText = titleRaw.trim().replace(/\s+/g, ' ')
        if (titleText) {
          await supabase
            .from('chat_sessions')
            .update({ title: titleText })
            .eq('id', sessionId)
            .eq('user_id', userId)
        }
      } catch {
        const fallback = content.trim().slice(0, 48)
        if (fallback) {
          await supabase
            .from('chat_sessions')
            .update({ title: fallback })
            .eq('id', sessionId)
            .eq('user_id', userId)
        }
      }
    }

    const { data: assistantMsg, error: aErr } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'assistant', content: text })
      .select()
      .single()
    if (aErr) throw aErr

    return NextResponse.json({ messages: [userMsg, assistantMsg] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
