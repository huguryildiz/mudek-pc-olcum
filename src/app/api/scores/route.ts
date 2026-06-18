import { NextRequest, NextResponse } from 'next/server'
import { upsertScore } from '@/lib/store'

export async function POST(req: NextRequest) {
  try {
    const { enrollmentId, itemId, raw } = await req.json()
    if (!enrollmentId || !itemId) {
      return NextResponse.json({ error: 'enrollmentId ve itemId zorunlu' }, { status: 400 })
    }
    const parsedRaw = raw === null || raw === undefined ? null : Number(raw)
    if (parsedRaw !== null && isNaN(parsedRaw)) {
      return NextResponse.json({ error: 'Geçersiz not değeri' }, { status: 400 })
    }
    upsertScore(enrollmentId, itemId, parsedRaw)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
