import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId, sessionId } = auth()
    return NextResponse.json({ ok: true, userId, sessionId })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'auth error' }, { status: 500 })
  }
}
