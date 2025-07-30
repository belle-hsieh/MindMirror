'use client'

import type { EmotionEntry } from '@/types/emotion'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { sign } from 'crypto'

export default function EmotionInput() {
    const { user, isSignedIn } = useUser()
    const [input, setInput] = useState('')
    const [emotions, setEmotions] = useState<EmotionEntry[]>([])

    const handleSubmit = () =>{
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
        return <p className="text-2xl font-medium">Please sign in to track your emotions.</p>
    }

    return (    
        <div className="emotion-input-container">
            <div className="emotion-list">
                <input
                className={`emotion-input ${input.trim() ? 'is_typing' : ''}`}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your emotions"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSubmit()
                    }
                }}
                />
                <button className="button" onClick={handleSubmit}>
                    Add
                </button>
            </div>
            <div className="emotion-list">
                {emotions.map((e) => (
                    <span 
                        key={e.timestamp}
                        className="emotion-item"
                    >
                        {e.word}
                    </span>
                ))}
            </div>
        </div>
    )
}