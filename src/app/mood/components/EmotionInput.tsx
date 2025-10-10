'use client'

import type { EmotionEntry } from '@/types/emotion'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'

export default function EmotionInput() {
    const { user, isSignedIn } = useUser()
    const [input, setInput] = useState('')
    const [emotions, setEmotions] = useState<EmotionEntry[]>([])

    const handleSubmit = async () =>{
        if (!input.trim()) return
        if (!user?.id) return
        if (!isSignedIn) {
            alert('Please sign in to add emotions.')
            return
        }

        const newEmotion: EmotionEntry = {  
            userId: user.id,
            word: input,
            timestamp: new Date().toISOString(),
        }

        const { error : addError, data } = await supabase.from('Emotions').insert(newEmotion).select()

        const cutoffTime = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

        const { error: filterError } = await supabase
            .from('Emotions')
            .delete()
            .eq('userId', user.id)
            .lt('timestamp', cutoffTime)

        if (addError || filterError) {
            console.error('Error saving emotion:', addError || filterError)
            return
        }
        setEmotions([...emotions, data[0]])
        setInput('')
    }

    const handleDelete = async (id: string) => {
        if (!user?.id) return
        if (!isSignedIn) {
            alert('Please sign in to delete emotions.')
            return
        }

        const { error: deleteError } = await supabase
            .from('Emotions')
            .delete()
            .eq('userId', user.id)
            .eq('id', id)

        if (deleteError) {
            console.error('Error deleting emotion:', deleteError)
            return
        }
        
        setEmotions(emotions.filter((e) => e.id !== id))
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
                <button className="button font-bold" onClick={handleSubmit}>
                    Add
                </button>
            </div>
            <div className="emotion-list">
                {emotions.map((e) => (
                    <span 
                        key={e.id}
                        className="emotion-item"
                    >
                        {e.word}
                        <button className="ml-2 font-bold" onClick={() => handleDelete(e.id!)}>X</button>
                    </span>
                ))}
            </div>
        </div>
    )
}