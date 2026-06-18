import { getStore, getStudentMap } from '@/lib/store'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { groupBy } from '@/lib/utils'
import GradeEntryClient from './GradeEntryClient'

export default async function GradeEntryPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const store = getStore()
  const course = store.courses.find(c => c.id === courseId)
  if (!course) notFound()

  const items = store.assessmentItems
    .filter(i => i.courseId === course.id)
    .sort((a, b) => a.order - b.order)

  const los = store.loDefinitions.filter(lo => lo.courseId === course.id)
  const enrollments = store.enrollments.filter(e => e.courseId === course.id)
  const students = enrollments
    .map(e => ({ enrollment: e, student: store.students.find(s => s.id === e.studentId)! }))
    .filter(x => x.student)
    .sort((a, b) => a.student.name.localeCompare(b.student.name, 'tr'))

  // Build initial score map: enrollmentId → itemId → raw
  const initialScores: Record<string, Record<string, number | null>> = {}
  for (const { enrollment } of students) {
    initialScores[enrollment.id] = {}
    for (const item of items) {
      const score = store.scores.find(
        s => s.enrollmentId === enrollment.id && s.itemId === item.id
      )
      initialScores[enrollment.id][item.id] = score?.raw ?? null
    }
  }

  // Group items by group code
  const grouped = groupBy(items, i => i.group)
  const groups = Array.from(new Set(items.map(i => i.group))).map(g => ({
    group: g,
    groupLabel: items.find(i => i.group === g)!.groupLabel,
    items: (grouped[g] ?? []).sort((a, b) => a.order - b.order),
  }))

  // Map itemId → LO codes that use it
  const itemToLOs: Record<string, string[]> = {}
  for (const lo of los) {
    for (const iw of lo.itemWeights) {
      if (!itemToLOs[iw.itemId]) itemToLOs[iw.itemId] = []
      itemToLOs[iw.itemId].push(lo.code)
    }
  }

  // Map itemId → contribution weight (first LO occurrence — weights are consistent across LOs)
  const itemWeights: Record<string, number> = {}
  for (const lo of los) {
    for (const iw of lo.itemWeights) {
      if (!(iw.itemId in itemWeights)) {
        itemWeights[iw.itemId] = iw.weight
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/dersler" className="hover:text-primary">Dersler</Link>
            <span>/</span>
            <Link href={`/dersler/${course.id}`} className="hover:text-primary">{course.code}</Link>
            <span>/</span>
            <span>Not Girişi</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">{course.code} — Not Girişi</h1>
          <p className="text-muted-foreground mt-1">
            Ölçüm kalemi bazında not girin. Her soru farklı bir öğrenme çıktısına aktarılır.
          </p>
        </div>
      </div>

      <GradeEntryClient
        courseId={course.id}
        groups={groups}
        students={students.map(x => ({ id: x.student.id, name: x.student.name, studentNo: x.student.studentNo, enrollmentId: x.enrollment.id }))}
        itemToLOs={itemToLOs}
        itemWeights={itemWeights}
        initialScores={initialScores}
      />
    </div>
  )
}
