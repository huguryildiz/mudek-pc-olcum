import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { getStore } from '@/lib/store'

// GET /api/evidence/[id] → kanıt dosyasını orijinal adıyla stream eder.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const store = getStore()
  const file = store.evidenceFiles.find(f => f.id === id)
  if (!file) {
    return NextResponse.json({ error: 'Kanıt bulunamadı' }, { status: 404 })
  }

  const filePath = path.join(process.cwd(), 'uploads', file.storedName)
  let buffer: Buffer
  try {
    buffer = await readFile(filePath)
  } catch {
    return NextResponse.json({ error: 'Dosya diskte bulunamadı' }, { status: 404 })
  }

  // Türkçe/ASCII olmayan orijinal ad için RFC 5987 filename* kullan.
  const asciiName = file.originalName.replace(/[^\x20-\x7E]/g, '_')
  const encodedName = encodeURIComponent(file.originalName)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Length': String(buffer.length),
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
    },
  })
}
