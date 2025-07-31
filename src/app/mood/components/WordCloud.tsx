'use client'

import type { EmotionEntry } from '@/types/emotion'
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { filterByTime } from '@/app/api/emotions/utils/filterByTime'

export default function WordCloud() {
    const { user, isSignedIn } = useUser()
    const [loading, setLoading] = useState(true)
    const [weekEmotions, setWeekEmotions] = useState<EmotionEntry[]>([])
    const [monthEmotions, setMonthEmotions] = useState<EmotionEntry[]>([])
    const [threeMonthEmotions, setThreeMonthEmotions] = useState<EmotionEntry[]>([])
    const [selectedRange, setSelectedRange] = useState<'week' | 'month' | 'three-months'>('week')

    useEffect(() => {
        if (!isSignedIn || !user) return
        
        const fetchEmotions = async () => {
            const [week, month, threeMonths] = await Promise.all([
                filterByTime(user.id, 'week'),
                filterByTime(user.id, 'month'),
                filterByTime(user.id, 'three-months')
            ])
            setWeekEmotions(week)
            setMonthEmotions(month)
            setThreeMonthEmotions(threeMonths)
            setLoading(false)
        }
        fetchEmotions()
    }, [isSignedIn, user])

    const toWordCloud = (emotions: EmotionEntry[]) => {
        return emotions
          .filter((e): e is EmotionEntry => !!e && typeof e.word === 'string')
          .map((emotion) => ({
            text: emotion.word,
            value: 1,
          }))
      }

    const options = {
        rotations: 2,
        rotationAngles: [0, 90] as [number, number],
        fontSizes: [15, 60] as [number, number],
        colors: [
          '#d8b4fe', // lavender
          '#c084fc', // light purple
          '#a855f7', // medium purple
          '#9333ea', // darker purple
          '#7e22ce', // deep purple
          '#6b21a8', // even deeper purple
        ],
      }

    let cloudData = []
    if (selectedRange === 'week') cloudData = toWordCloud(weekEmotions)
    else if (selectedRange === 'month') cloudData = toWordCloud(monthEmotions)
    else cloudData = toWordCloud(threeMonthEmotions)

    return (
        <div className="word-cloud-container">
            <h2 className="text-center text-5xl">💭 Word Cloud 💭</h2>
            <div className="word-cloud-sidebar">
                <button className="button font-500 w-7/24" onClick={() => setSelectedRange('week')}>Last Week</button>
                <button className="button font-500 w-7/24" onClick={() => setSelectedRange('month')}>Last 30 Days</button>
                <button className="button font-500 w-7/24" onClick={() => setSelectedRange('three-months')}>Last 90 Days</button>
            </div>
            <div className="word-cloud">
            </div>
        </div>
    )
}