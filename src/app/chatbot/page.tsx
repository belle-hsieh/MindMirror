'use client'

import CornerImage from '@/components/CornerImage'
import Link from 'next/link'
import { useState } from 'react'
import ChatSidebar from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'

export default function Chatbot() {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

    const createSession = async () => {
        const res = await fetch('/chatbot/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
        const json = await res.json()
        if (json.session?.id) setActiveSessionId(json.session.id)
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="fixed inset-0 z-0">
                <CornerImage position="top-left" src="/corner-top-left.png" alt="Top-left corner decoration" />
                <CornerImage position="top-right" src="/corner-top-right.png" alt="Top-right corner decoration" />
                <CornerImage position="bottom-left" src="/corner-bottom-left.png" alt="Bottom-left corner decoration" />
                <CornerImage position="bottom-right" src="/corner-bottom-right.png" alt="Bottom-right corner decoration" />
            </div>
            <Link href="/" className="absolute top-4 left-4 z-10 text-black hover:text-purple-500 transition-colors">
                ← Back to Home
            </Link>
            <main className="relative z-10">
                <div className="flex">
                    <ChatSidebar activeId={activeSessionId} onSelect={setActiveSessionId} onCreate={createSession} />
                    <ChatWindow sessionId={activeSessionId} />
                </div>
            </main>
        </div>
    )
}