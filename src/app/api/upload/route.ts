import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { addEvidenceFile, getStore } from '@/lib/store'
import { bboSafeFilename, generateDocFilename } from '@/lib/utils'
import type { EvidenceFile } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const courseId = formData.get('courseId') as string | null
    const category = formData.get('category') as string | null
    const itemIdsRaw = formData.get('itemIds') as string | null
    // Phase 0: no auth — placeholder until real session is wired
    const uploadedBy = 'Demo Kullanıcı'

    if (!file || !courseId || !category) {
      return NextResponse.json({ error: 'file, courseId ve category zorunlu' }, { status: 400 })
    }

    const store = getStore()
    const course = store.courses.find(c => c.id === courseId)
    if (!course) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 })
    }

    // itemIds: JSON dizi string'i; geçersizse boş diziye düş.
    // Yalnızca bu derse ait gerçek soru id'lerini kabul et.
    let itemIds: string[] = []
    if (itemIdsRaw) {
      try {
        const parsed = JSON.parse(itemIdsRaw)
        if (Array.isArray(parsed)) {
          const courseItemIds = new Set(
            store.assessmentItems.filter(i => i.courseId === courseId).map(i => i.id),
          )
          itemIds = parsed.filter((id): id is string => typeof id === 'string' && courseItemIds.has(id))
        }
      } catch {
        itemIds = []
      }
    }

    const ext = file.name.split('.').pop() ?? 'bin'
    const storedName = generateDocFilename({
      courseCode: course.code,
      section: '01',
      semester: course.semester,
      docType: bboSafeFilename(category),
      ext,
    })

    const uploadDir = path.join(process.cwd(), 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, storedName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    const evidenceFile: EvidenceFile = {
      id: `ev-${Date.now()}`,
      courseId,
      originalName: file.name,
      storedName,
      category,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: uploadedBy || undefined,
      itemIds: itemIds.length > 0 ? itemIds : undefined,
    }

    addEvidenceFile(evidenceFile)

    return NextResponse.json({ ok: true, storedName })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
