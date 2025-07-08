'use client'

import type { EmotionEntry } from '@/types/emotion'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

export default function EmotionInput() {
    const { user, isSignedIn } = useUser()
    const [input, setInput] = useState('')
    const [emotions, setEmotions] = useState<EmotionEntry[]>([])

    const handleSubmit = () => {
        if (!input.trim()) return
        if (!isSignedIn) {
            alert('Please sign in to add emotions.')
            return
        }

        const newEmotion: EmotionEntry = {  
            userId: user.id,
            word: input,
            timestamp: new Date().toISOString(),
        }

        setEmotions([...emotions, newEmotion])
        setInput('')
    }

    if (!isSignedIn) {
        return <p>Please sign in to track your emotions.</p>
    }

    return (    
        <div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your emotion"
            />
            <button onClick={handleSubmit}>Add</button>
        </div>
    )
}