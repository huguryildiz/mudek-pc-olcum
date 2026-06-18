// ────────────────────────────────────────────────────────
// In-memory singleton store with JSON file persistence
// No DB, no migrations. JSON file at data/store.json
// ────────────────────────────────────────────────────────

import fs from 'fs'
import path from 'path'
import type {
  Program, Course, AssessmentItem, LODefinition,
  Student, Enrollment, Score, EvidenceFile
} from './types'

export interface StoreData {
  programs: Program[]
  courses: Course[]
  assessmentItems: AssessmentItem[]
  loDefinitions: LODefinition[]
  students: Student[]
  enrollments: Enrollment[]
  scores: Score[]
  evidenceFiles: EvidenceFile[]
}

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json')

let _store: StoreData | null = null

function emptyStore(): StoreData {
  return {
    programs: [],
    courses: [],
    assessmentItems: [],
    loDefinitions: [],
    students: [],
    enrollments: [],
    scores: [],
    evidenceFiles: [],
  }
}

export function getStore(): StoreData {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8')
    _store = JSON.parse(raw) as StoreData
    // Migrate Turkish field name pçKatkılar → poContributions (from rename period)
    for (const lo of _store.loDefinitions) {
      const loAny = lo as unknown as Record<string, unknown>
      if (!lo.poContributions && loAny['pçKatkılar']) {
        lo.poContributions = loAny['pçKatkılar'] as LODefinition['poContributions']
      }
      lo.poContributions ??= []
    }
  } catch {
    if (!_store) {
      _store = emptyStore()
      persist()
    }
  }
  return _store!
}

export function clearStoreCache() {
  _store = null
}

export function persist() {
  try {
    const dir = path.dirname(STORE_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STORE_PATH, JSON.stringify(_store, null, 2), 'utf-8')
  } catch (e) {
    console.error('Store persist error:', e)
  }
}

export function resetStore(data: StoreData) {
  _store = data
  persist()
}

// ── Convenience accessors ─────────────────────────────────

export function getCourse(id: string) {
  return getStore().courses.find(c => c.id === id)
}

export function getCourseItems(courseId: string) {
  return getStore().assessmentItems.filter(i => i.courseId === courseId)
}

export function getCourseLOs(courseId: string) {
  return getStore().loDefinitions.filter(lo => lo.courseId === courseId)
}

export function getCourseEnrollments(courseId: string) {
  return getStore().enrollments.filter(e => e.courseId === courseId)
}

export function getEnrollmentScores(enrollmentId: string) {
  return getStore().scores.filter(s => s.enrollmentId === enrollmentId)
}

export function upsertScore(enrollmentId: string, itemId: string, raw: number | null) {
  const store = getStore()
  const existing = store.scores.find(
    s => s.enrollmentId === enrollmentId && s.itemId === itemId
  )
  if (existing) {
    existing.raw = raw
  } else {
    store.scores.push({ id: `${enrollmentId}__${itemId}`, enrollmentId, itemId, raw })
  }
  persist()
}

export function updateLODefinition(loId: string, patch: Partial<Pick<LODefinition, 'label' | 'itemWeights' | 'poContributions'>>) {
  const store = getStore()
  const lo = store.loDefinitions.find(l => l.id === loId)
  if (!lo) return
  Object.assign(lo, patch)
  persist()
}

export function addEvidenceFile(file: EvidenceFile) {
  getStore().evidenceFiles.push(file)
  persist()
}

export function getStudentMap() {
  const store = getStore()
  return new Map(store.students.map(s => [s.id, s]))
}

export function upsertStudentByNo(studentNo: string, name: string): Student {
  if (!/^\d{11}$/.test(studentNo)) {
    throw new Error(`Geçersiz öğrenci no: "${studentNo}". Öğrenci no 11 haneli rakamdan oluşmalıdır.`)
  }
  const store = getStore()
  const existing = store.students.find(s => s.studentNo === studentNo)
  if (existing) {
    if (name && name !== existing.name) {
      existing.name = name
      persist()
    }
    return existing
  }
  const student: Student = {
    id: `student-${studentNo}-${Date.now()}`,
    studentNo,
    name: name || studentNo,
  }
  store.students.push(student)
  persist()
  return student
}

export function upsertEnrollment(studentId: string, courseId: string): Enrollment {
  const store = getStore()
  const existing = store.enrollments.find(
    e => e.studentId === studentId && e.courseId === courseId
  )
  if (existing) return existing
  const section = store.courses.find(c => c.id === courseId)?.sections?.[0] ?? '01'
  const enrollment: Enrollment = {
    id: `enroll-${studentId}-${courseId}`,
    studentId,
    courseId,
    section,
  }
  store.enrollments.push(enrollment)
  persist()
  return enrollment
}
