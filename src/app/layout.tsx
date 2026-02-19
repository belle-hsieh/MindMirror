import { type Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import HeaderAuth from '@/components/HeaderAuth'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'MindMirror',
  description: 'Your Personal Health & Wellness Companion',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <HeaderAuth />
        {children}
      </body>
    </html>
  )
}
