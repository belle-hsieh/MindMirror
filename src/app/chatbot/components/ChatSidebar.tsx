'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

interface Session {
  id: string
  title: string
  created_at: string
}

export default function ChatSidebar({
  activeId,
  onSelect,
  onCreate,
  onDeleted,
}: {
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDeleted: (id: string) => void
}) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const handleDelete = async (sessionId: string) => {
    const confirmed = window.confirm('Delete this chat? This cannot be undone.')
    if (!confirmed) return
    const res = await fetch(`/chatbot/api/sessions/${sessionId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (res.status === 401) {
      alert('Please sign in to delete chats.')
      return
    }
    if (!res.ok) {
      alert(json.error || 'Failed to delete chat')
      return
    }
    if (activeId === sessionId) onDeleted(sessionId)
    await load()
  }

  const handleRename = async (sessionId: string, title: string) => {
    const res = await fetch(`/chatbot/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
      credentials: 'include',
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(json.error || 'Failed to rename chat')
      return
    }
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title } : s)))
  }


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
            <div
              key={s.id}
              className={`w-full px-3 py-3 rounded-md mb-2 transition ${
                activeId === s.id ? 'bg-[#ede9fe] text-[#6c47ff] border border-[#6c47ff]' : 'hover:bg-gray-100'
              }`}
            >
              <button
                onClick={() => onSelect(s.id)}
                onDoubleClick={(event) => {
                  event.preventDefault()
                  setEditingId(s.id)
                  setDraftTitle(s.title)
                }}
                className="w-full text-left"
              >
                {editingId === s.id ? (
                  <input
                    autoFocus
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-800"
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={() => {
                      const title = draftTitle.trim()
                      if (title) handleRename(s.id, title)
                      setEditingId(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        const title = draftTitle.trim()
                        if (title) handleRename(s.id, title)
                        setEditingId(null)
                      }
                      if (event.key === 'Escape') setEditingId(null)
                    }}
                  />
                ) : (
                  <div className="text-sm font-semibold truncate">{s.title}</div>
                )}
                <div className="text-xs opacity-60">{new Date(s.created_at).toLocaleString()}</div>
              </button>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                  type="button"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
