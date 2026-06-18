import { getStore, getStudentMap } from '@/lib/store'
import { resetStore } from '@/lib/store'
import { createSeedData } from '@/lib/seed'
import { computeCourseResult, computeProgramPO, buildPOEvidenceTree } from '@/lib/engine'
import { ALL_POS, PO_LABELS, PO_DESCRIPTIONS, attainmentLevel } from '@/lib/types'
import type { PO_ID, POEvidenceTree } from '@/lib/types'
import { formatScore, poDisplayId } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { TrendingUp, BookOpen, Users, AlertTriangle } from 'lucide-react'
import POEvidenceTrigger from './POEvidenceTrigger'

function ensureSeed() {
  const store = getStore()
  if (store.programs.length === 0) {
    resetStore(createSeedData())
  }
}

function attainBadgeVariant(score: number | null): 'below' | 'border' | 'above' | 'secondary' {
  const level = attainmentLevel(score)
  if (level === 'below') return 'below'
  if (level === 'border') return 'border'
  if (level === 'above') return 'above'
  return 'secondary'
}

function AttainCell({ score }: { score: number | null }) {
  const level = attainmentLevel(score)
  const classes = {
    below:     'bg-attainment-below-bg text-attainment-below font-semibold',
    border:    'bg-attainment-border-bg text-attainment-border font-semibold',
    above:     'bg-attainment-above-bg text-attainment-above font-semibold',
    unmeasured:'bg-muted text-muted-foreground',
  }[level]

  return (
    <td className={`px-3 py-2 text-center tabular text-sm ${classes}`}>
      {formatScore(score)}
    </td>
  )
}

export default function DashboardPage() {
  ensureSeed()
  const store = getStore()
  const studentMap = getStudentMap()

  const courseResults = store.courses.map(course => {
    const items = store.assessmentItems.filter(i => i.courseId === course.id)
    const los = store.loDefinitions.filter(lo => lo.courseId === course.id)
    const enrollments = store.enrollments.filter(e => e.courseId === course.id)
    return computeCourseResult(course, items, los, enrollments, store.scores, studentMap)
  })

  const program = store.programs[0]
  const programPO = program
    ? computeProgramPO(courseResults, store.courses, program.curriculumMap, studentMap)
    : []

  // PÇ başına kanıt ağacı (Soru → ÖÇ → PÇ zincirinden türetilir)
  const evidenceTrees = {} as Record<PO_ID, POEvidenceTree>
  for (const poId of ALL_POS) {
    evidenceTrees[poId] = buildPOEvidenceTree(
      poId,
      store.courses,
      store.loDefinitions,
      store.assessmentItems,
      store.evidenceFiles,
    )
  }

  const measured = programPO.filter(p => p.programAvg !== null)
  const below = measured.filter(p => attainmentLevel(p.programAvg) === 'below').length
  const above = measured.filter(p => attainmentLevel(p.programAvg) === 'above').length
  const border = measured.filter(p => attainmentLevel(p.programAvg) === 'border').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Program Çıktıları Genel Görünümü</h1>
        <p className="text-muted-foreground mt-1">
          {store.courses.length} ders · {store.students.length} öğrenci · 5/0 ölçek
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-ink">{store.courses.length}</p>
                <p className="text-xs text-muted-foreground">Ders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold text-ink">{store.students.length}</p>
                <p className="text-xs text-muted-foreground">Öğrenci</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-attainment-above" />
              <div>
                <p className="text-2xl font-bold text-attainment-above">{above}</p>
                <p className="text-xs text-muted-foreground">PÇ Hedefte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-attainment-below" />
              <div>
                <p className="text-2xl font-bold text-attainment-below">{below}</p>
                <p className="text-xs text-muted-foreground">PÇ Yetersiz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PO Attainment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Program Çıktıları Başarı Matrisi</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-48">Program Çıktısı</th>
                {store.courses.map(c => (
                  <th key={c.id} className="px-3 py-3 text-center font-medium text-muted-foreground whitespace-nowrap">
                    {c.code}
                  </th>
                ))}
                <th className="px-3 py-3 text-center font-semibold text-ink bg-muted/50 whitespace-nowrap">
                  Program Ort.
                </th>
              </tr>
            </thead>
            <tbody>
              {ALL_POS.map(poId => {
                const progEntry = programPO.find(p => p.poId === poId)
                return (
                  <tr key={poId} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <POEvidenceTrigger
                        poDisplay={poDisplayId(poId)}
                        poLabel={PO_LABELS[poId]}
                        poDescription={PO_DESCRIPTIONS[poId]}
                        tree={evidenceTrees[poId]}
                      />
                    </td>
                    {courseResults.map(cr => {
                      const score = cr.coursePOAvg[poId]
                      return <AttainCell key={cr.courseId} score={score} />
                    })}
                    <AttainCell score={progEntry?.programAvg ?? null} />
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Legend + quick links */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-attainment-above-bg border border-attainment-above/30" />
            Hedefte (&ge;3.0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-attainment-border-bg border border-attainment-border/30" />
            Sınırda (2.5–3.0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-attainment-below-bg border border-attainment-below/30" />
            Yetersiz (&lt;2.5)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-muted border border-border" />
            Ölçülmedi
          </span>
        </div>
        <Link href="/dersler" className="text-sm text-primary hover:underline">
          Ders detaylarına git →
        </Link>
      </div>

      {/* Per-student program PO table */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Bazlı Program Çıktıları (Ek-2)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Öğrenci</th>
                <th className="px-3 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">Öğrenci No</th>
                {ALL_POS.map(poId => (
                  <th key={poId} className="px-2 py-3 text-center font-medium text-muted-foreground text-xs">
                    <POEvidenceTrigger
                      poDisplay={poDisplayId(poId)}
                      poLabel={PO_LABELS[poId]}
                      poDescription={PO_DESCRIPTIONS[poId]}
                      tree={evidenceTrees[poId]}
                      variant="header"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {store.students.map(student => (
                <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium text-ink whitespace-nowrap">{student.name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{student.studentNo}</td>
                  {ALL_POS.map(poId => {
                    const entry = programPO.find(p => p.poId === poId)
                    const ss = entry?.studentScores.find(s => s.studentId === student.id)
                    return <AttainCell key={poId} score={ss?.score ?? null} />
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
