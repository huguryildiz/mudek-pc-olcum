'use server'

import { upsertScore, upsertStudentByNo, upsertEnrollment, getStore } from '@/lib/store'

export async function saveScore(enrollmentId: string, itemId: string, raw: number | null) {
  upsertScore(enrollmentId, itemId, raw)
}

export interface ImportRow {
  studentNo: string
  name: string
  scores: { itemCode: string; raw: number | null }[]
}

export async function importScores(
  courseId: string,
  rows: ImportRow[]
): Promise<{ imported: number; studentsCreated: number; studentsUpdated: number }> {
  const store = getStore()
  const items = store.assessmentItems.filter(i => i.courseId === courseId)
  const itemCodeMap = new Map(items.map(i => [i.code.toUpperCase(), i.id]))

  let imported = 0
  let studentsCreated = 0
  let studentsUpdated = 0

  for (const row of rows) {
    if (!/^\d{11}$/.test(row.studentNo)) continue
    const existed = store.students.find(s => s.studentNo === row.studentNo)
    const student = upsertStudentByNo(row.studentNo, row.name)
    if (!existed) studentsCreated++
    else studentsUpdated++

    const enrollment = upsertEnrollment(student.id, courseId)

    for (const { itemCode, raw } of row.scores) {
      const itemId = itemCodeMap.get(itemCode.toUpperCase())
      if (!itemId) continue
      upsertScore(enrollment.id, itemId, raw)
      imported++
    }
  }

  return { imported, studentsCreated, studentsUpdated }
}
