'use client'

import { useEffect, useState } from 'react'

interface Session {
  id: string
  title: string
  created_at: string
}

export default function ChatSidebar({
  activeId,
  onSelect,
  onCreate,
}: {
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
}) {
  const [sessions, setSessions] = useState<Session[]>([])

  const load = async () => {
    const res = await fetch('/chatbot/api/sessions', { credentials: 'include' })
    if (res.status === 401) {
      alert('Please sign in to view your chats.')
      setSessions([])
      return
    }
    const json = await res.json()
    if (!res.ok) {
      console.error(json.error)
      return
    }
    setSessions(json.sessions || [])
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <aside className="w-72 h-screen border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={async () => {
            await onCreate()
            await load()
          }}
          className="w-full h-10 rounded-md bg-[#6c47ff] text-white hover:bg-[#5a36f0] transition"
        >
          + New chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No chats yet</p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`w-full text-left px-3 py-3 rounded-md mb-2 transition ${
                activeId === s.id ? 'bg-[#ede9fe] text-[#6c47ff] border border-[#6c47ff]' : 'hover:bg-gray-100'
              }`}
            >
              <div className="text-sm font-semibold truncate">{s.title}</div>
              <div className="text-xs opacity-60">{new Date(s.created_at).toLocaleString()}</div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
