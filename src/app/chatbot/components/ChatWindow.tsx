'use client'

import { useEffect, useRef, useState } from 'react'
import CornerImage from '@/components/CornerImage'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export default function ChatWindow({
  sessionId,
  onCreateSession,
}: {
  sessionId: string | null
  onCreateSession: () => Promise<string | null>
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const load = async () => {
      if (!sessionId) return
      const res = await fetch(`/chatbot/api/sessions/${sessionId}/messages`, { credentials: 'include' })
      if (res.status === 401) {
        alert('Please sign in to view chat messages.')
        setMessages([])
        return
      }
      const json = await res.json()
      if (!res.ok) {
        console.error(json.error)
        return
      }
      setMessages(json.messages || [])
    }
    load()
  }, [sessionId])

  const send = async () => {
    if (!input.trim() || busy) return
    let activeSessionId = sessionId
    if (!activeSessionId) {
      activeSessionId = await onCreateSession()
    }
    if (!activeSessionId) {
      alert('Unable to create a new chat. Please try again.')
      return
    }
    setBusy(true)
    try {
      const res = await fetch(`/chatbot/api/sessions/${activeSessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
        credentials: 'include',
      })
      if (res.status === 401) {
        alert('Please sign in to send messages.')
        return
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send message')
      setMessages((prev) => [...prev, ...json.messages])
      setInput('')
    } catch (e) {
      console.error(e)
      alert('Failed to send message')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex-1 h-screen flex flex-col relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CornerImage position="top-left" src="/corner-top-left.png" alt="Top-left corner decoration" />
        <CornerImage position="top-right" src="/corner-top-right.png" alt="Top-right corner decoration" />
        <CornerImage position="bottom-left" src="/corner-bottom-left.png" alt="Bottom-left corner decoration" />
        <CornerImage position="bottom-right" src="/corner-bottom-right.png" alt="Bottom-right corner decoration" />
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 pb-24">
          {messages.length === 0 ? (
            <div className="pt-20 text-center text-gray-500">
              <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-sm">Ask anything about wellness, journaling, and reflection.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="w-full my-4">
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-[#6c47ff] text-white' : 'bg-[#ede9fe] text-[#6c47ff]'}`}>{m.role === 'user' ? 'U' : 'MM'}</div>
                  <div className="flex-1 whitespace-pre-wrap leading-relaxed text-[15px]">
                    {m.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className="fixed bottom-0 left-72 right-0 bg-gradient-to-t from-white to-transparent">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <input
              className="flex-1 h-12 px-4 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-[#6c47ff]"
              placeholder={sessionId ? 'Send a message…' : 'Start a new chat…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              disabled={busy}
            />
            <button
              className="h-12 px-4 rounded-md bg-[#6c47ff] text-white hover:bg-[#5a36f0] transition"
              onClick={send}
              disabled={!sessionId || busy}
            >
              {busy ? 'Thinking…' : 'Send'}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">MindMirror uses Gemini. Responses may be imperfect.</p>
        </div>
      </div>
    </section>
  )
}
