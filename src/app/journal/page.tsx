'use client'

import CornerImage from '@/components/CornerImage';
import Link from 'next/link';
import JournalEditor from './components/JournalEditor';

export default function Journal() {
    return (
        <div className="min-h-screen bg-white">
            {/* Corner Images */}
            <div className="fixed inset-0 z-0">
                <CornerImage
                position="top-left"
                src="/corner-top-left.png"
                alt="Top-left corner decoration"
                />
                <CornerImage
                position="top-right"
                src="/corner-top-right.png"
                alt="Top-right corner decoration"
                />
                <CornerImage
                position="bottom-left"
                src="/corner-bottom-left.png"
                alt="Bottom-left corner decoration"
                />
                <CornerImage
                position="bottom-right"
                src="/corner-bottom-right.png"
                alt="Bottom-right corner decoration"
                />
            </div>
            <Link href="/" className="absolute top-4 left-4 z-10 text-black hover:text-purple-500 transition-colors">
                ← Back to Home
            </Link>
            <main className="relative z-10">
                <JournalEditor />
            </main>
        </div>
    )
}