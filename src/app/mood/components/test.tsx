'use client'

import dynamic from 'next/dynamic'

const ReactWordcloud = dynamic(() => import('react-wordcloud'), { ssr: false })

export default function TestCloud() {
  const words = [
    { text: 'happy', value: 10 },
    { text: 'sad', value: 5 },
    { text: 'excited', value: 15 },
  ]

  return (
    <div style={{ height: 400, width: 600 }}>
      <ReactWordcloud words={words} />
    </div>
  )
}