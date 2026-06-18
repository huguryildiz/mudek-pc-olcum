import { NextResponse } from 'next/server'
import { getStore, getStudentMap } from '@/lib/store'
import { computeCourseResult, computeProgramPO } from '@/lib/engine'
import { ALL_POS } from '@/lib/types'
import { readFile } from 'fs/promises'
import path from 'path'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { bboSafeFilename } from '@/lib/utils'

function sheetFromMatrix(headers: string[], rows: (string | number | null)[][]): XLSX.WorkSheet {
  const data = [headers, ...rows]
  return XLSX.utils.aoa_to_sheet(data)
}

export async function GET() {
  try {
    const store = getStore()
    const studentMap = getStudentMap()

    const courseResults = store.courses.map(course => {
      const items = store.assessmentItems.filter(i => i.courseId === course.id)
      const los = store.loDefinitions.filter(lo => lo.courseId === course.id)
      const enrollments = store.enrollments.filter(e => e.courseId === course.id)
      return { course, result: computeCourseResult(course, items, los, enrollments, store.scores, studentMap) }
    })

    const program = store.programs[0]
    const programPO = program
      ? computeProgramPO(
          courseResults.map(cr => cr.result),
          store.courses,
          program.curriculumMap,
          studentMap,
        )
      : []

    const zip = new JSZip()

    // ── EK-2: Program PO Matrix (PO × Course + Program Avg) ────────────
    {
      const headers = ['Program Ciktisi', ...store.courses.map(c => c.code), 'Program Ort.']
      const rows = ALL_POS.map(poId => {
        const progEntry = programPO.find(p => p.poId === poId)
        return [
          poId,
          ...courseResults.map(({ result }) => result.coursePOAvg[poId] ?? ''),
          progEntry?.programAvg ?? '',
        ] as (string | number | null)[]
      })
      const ws = sheetFromMatrix(headers, rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Program PC Matrix')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
      zip.file('EK-2_Program_PC_Matrix.xlsx', buf)
    }

    // ── EK-2: Student PO Table ──────────────────────────────────────────
    {
      const headers = ['Ogrenci', ...ALL_POS.map(p => p.replace('-', '_'))]
      const rows = store.students.map(student => {
        return [
          student.name,
          ...ALL_POS.map(poId => {
            const entry = programPO.find(p => p.poId === poId)
            const ss = entry?.studentScores.find(s => s.studentId === student.id)
            return ss?.score ?? ''
          }),
        ] as (string | number | null)[]
      })
      const ws = sheetFromMatrix(headers, rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Student PC Table')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
      zip.file('EK-2_Student_PC_Table.xlsx', buf)
    }

    // ── Per-course LO score sheets ──────────────────────────────────────
    for (const { course, result } of courseResults) {
      const los = store.loDefinitions.filter(lo => lo.courseId === course.id)
      const headers = ['Ogrenci', ...los.map(lo => lo.code)]
      const rows = result.students.map(s => [
        s.studentName,
        ...los.map(lo => s.loScores.find(l => l.loId === lo.id)?.score ?? ''),
      ] as (string | number | null)[])

      const ws = sheetFromMatrix(headers, rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'LO Scores')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
      zip.file(`${bboSafeFilename(course.code)}_LO_Scores.xlsx`, buf)
    }

    // ── Evidence files ──────────────────────────────────────────────────
    if (store.evidenceFiles.length > 0) {
      const evidenceFolder = zip.folder('evidence')!
      for (const ef of store.evidenceFiles) {
        try {
          const filePath = path.join(process.cwd(), 'uploads', ef.storedName)
          const buf = await readFile(filePath)
          evidenceFolder.file(ef.storedName, buf)
        } catch {
          // Skip missing files
        }
      }
    }

    const zipUint8 = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
    const zipAB = zipUint8.buffer.slice(zipUint8.byteOffset, zipUint8.byteOffset + zipUint8.byteLength) as ArrayBuffer
    const blob = new Blob([zipAB], { type: 'application/zip' })

    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="mudek-bbo.zip"',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
