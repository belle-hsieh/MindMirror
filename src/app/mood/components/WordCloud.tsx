'use client'

import type { EmotionEntry } from '@/types/emotion'
import React, { useState, useEffect } from 'react'
import { filterByTime } from '@/app/mood/api/filterByTime'
import { supabase } from '@/lib/supabase'

export default function WordCloud() {
    const [userId, setUserId] = useState<string | null>(null)
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [weekEmotions, setWeekEmotions] = useState<EmotionEntry[]>([])
    const [monthEmotions, setMonthEmotions] = useState<EmotionEntry[]>([])
    const [threeMonthEmotions, setThreeMonthEmotions] = useState<EmotionEntry[]>([])
    const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'three-months'>('week')

    useEffect(() => {
        const readUser = async () => {
            const { data } = await supabase.auth.getUser()
            if (data.user) {
                setUserId(data.user.id)
                setIsSignedIn(true)
            } else {
                setUserId(null)
                setIsSignedIn(false)
            }
        }

        readUser()

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUserId(session.user.id)
                setIsSignedIn(true)
            } else {
                setUserId(null)
                setIsSignedIn(false)
            }
        })

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        if (!isSignedIn || !userId) return
        
        const fetchEmotions = async () => {
            const [week, month, threeMonths] = await Promise.all([
                filterByTime(userId, 'week'),
                filterByTime(userId, 'month'),
                filterByTime(userId, 'three-months')
            ])
            setWeekEmotions(week)
            setMonthEmotions(month)
            setThreeMonthEmotions(threeMonths)
        }
        fetchEmotions()
    }, [isSignedIn, userId])

    const toWordCloud = (emotions: EmotionEntry[]) => {
        
        const wordFrequency: { [key: string]: number } = {}
        emotions
          .filter((e): e is EmotionEntry => !!e && typeof e.word === 'string')
          .forEach((emotion) => {
            const word = emotion.word.toLowerCase()
            wordFrequency[word] = (wordFrequency[word] || 0) + 1
          })
        
        // Convert to array with frequency values
        return Object.entries(wordFrequency).map(([word, count]) => ({
          text: word,
          value: count,
        }))
      }

    const colors = [
      '#d8b4fe', // lavender
      '#c084fc', // light purple
      '#a855f7', // medium purple
      '#9333ea', // darker purple
      '#7e22ce', // deep purple
      '#6b21a8', // even deeper purple
    ]

    let cloudData = []
    if (selectedRange === 'week') cloudData = toWordCloud(weekEmotions)
    else if (selectedRange === 'month') cloudData = toWordCloud(monthEmotions)
    else cloudData = toWordCloud(threeMonthEmotions)

    // Calculate font size based on frequency
    const maxFrequency = Math.max(...cloudData.map(d => d.value), 1)
    const minFontSize = 16
    const maxFontSize = 72

    return (
        <div className="word-cloud-container">
            <h2 className="text-center text-5xl mb-6 font-bold underline">💭 Word Cloud 💭</h2>
            <div className="word-cloud-sidebar">
                <button className="button font-500 w-7/24" onClick={() => setSelectedRange('week')}>Last Week</button>
                <button className="button font-500 w-7/24" onClick={() => setSelectedRange('month')}>Last 30 Days</button>
                <button className="button font-500 w-7/24" onClick={() => setSelectedRange('three-months')}>Last 90 Days</button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 p-8 min-h-[400px] bg-white/90 rounded-lg">
                {cloudData.length === 0 ? (
                    <p className="text-gray-400 text-lg">No emotions recorded yet</p>
                ) : (
                    cloudData.map((word, index) => {
                        const fontSize = minFontSize + ((word.value - 1) / (maxFrequency - 1)) * (maxFontSize - minFontSize)
                        const color = colors[index % colors.length]
                        const rotation = Math.random() > 0.5 ? 0 : 90
                        
                        return (
                            <span
                                key={`${word.text}-${index}`}
                                style={{
                                    fontSize: `${fontSize}px`,
                                    color: color,
                                    transform: `rotate(${rotation}deg)`,
                                    fontWeight: 600,
                                    padding: '8px',
                                    display: 'inline-block',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                }}
                                className="hover:scale-110"
                                title={`${word.text}: ${word.value} time${word.value > 1 ? 's' : ''}`}
                            >
                                {word.text}
                            </span>
                        )
                    })
                )}
            </div>
        </div>
    )
}