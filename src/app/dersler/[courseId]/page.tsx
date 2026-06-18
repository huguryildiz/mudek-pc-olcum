import { getStore, getStudentMap } from '@/lib/store'
import { computeCourseResult } from '@/lib/engine'
import { ALL_POS, PO_LABELS, PO_DESCRIPTIONS, attainmentLevel } from '@/lib/types'
import { formatScore, poDisplayId } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LOMapClient from './LOMapClient'
import CourseItemsClient from './CourseItemsClient'

function AttainLegend() {
  return (
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
  )
}

function AttainCell({ score }: { score: number | null }) {
  const level = attainmentLevel(score)
  const classes = {
    below:     'bg-attainment-below-bg text-attainment-below font-semibold',
    border:    'bg-attainment-border-bg text-attainment-border font-semibold',
    above:     'bg-attainment-above-bg text-attainment-above font-semibold',
    unmeasured:'text-muted-foreground',
  }[level]
  return (
    <td className={`px-3 py-2 text-center text-sm tabular-nums ${classes}`}>
      {formatScore(score)}
    </td>
  )
}

function AvgCell({ score }: { score: number | null }) {
  return (
    <td className="px-3 py-2 text-center text-sm tabular-nums bg-primary/10 text-primary font-semibold">
      {formatScore(score)}
    </td>
  )
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const store = getStore()
  const studentMap = getStudentMap()
  const course = store.courses.find(c => c.id === courseId)
  if (!course) notFound()

  const items = store.assessmentItems.filter(i => i.courseId === course.id)
  const los = store.loDefinitions.filter(lo => lo.courseId === course.id)
  const enrollments = store.enrollments.filter(e => e.courseId === course.id)
  const result = computeCourseResult(course, items, los, enrollments, store.scores, studentMap)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/dersler" className="hover:text-primary">Dersler</Link>
            <span>/</span>
            <span>{course.code}</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">{course.code} — {course.name}</h1>
          <p className="text-muted-foreground mt-1">{course.semester} · {course.instructors.join(', ')}</p>
        </div>
        <Link
          href={`/dersler/${course.id}/notlar`}
          className="inline-flex items-center text-sm px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Not Girişi
        </Link>
      </div>

      {/* Course PO Attainment — transposed: rows = students, cols = PÇ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle>Ders Düzeyinde Program Çıktısı Başarısı</CardTitle>
          <AttainLegend />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {(() => {
            const activePOs = ALL_POS.filter(poId => result.coursePOAvg[poId] !== null)
            return (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Öğrenci</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">Öğrenci No</th>
                    {activePOs.map(poId => (
                      <th key={poId} className="px-3 py-3 text-center font-medium text-muted-foreground text-xs whitespace-nowrap">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-default">
                                <span className="font-semibold text-ink">{poDisplayId(poId)}</span>
                                <span className="block text-[10px] font-normal text-muted-foreground">{PO_LABELS[poId]}</span>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{PO_DESCRIPTIONS[poId]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.students.map(s => (
                    <tr key={s.studentId} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium text-ink whitespace-nowrap">{s.studentName}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{studentMap.get(s.studentId)?.studentNo ?? '—'}</td>
                      {activePOs.map(poId => {
                        const score = s.poScores.find(p => p.poId === poId)?.score ?? null
                        return <AttainCell key={poId} score={score} />
                      })}
                    </tr>
                  ))}
                  {/* Class average row */}
                  <tr className="border-t-2 border-primary/20 bg-primary/5">
                    <td className="px-4 py-2 font-semibold text-primary text-xs">Sınıf Ort.</td>
                    <td className="px-4 py-2" />
                    {activePOs.map(poId => (
                      <AvgCell key={poId} score={result.coursePOAvg[poId]} />
                    ))}
                  </tr>
                </tbody>
              </table>
            )
          })()}
        </CardContent>
      </Card>

      {/* LO Scores Table — transposed: rows = students, cols = ÖÇ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle>Öğrenme Çıktısı Puanları</CardTitle>
          <AttainLegend />
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Öğrenci</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs whitespace-nowrap">Öğrenci No</th>
                {los.map(lo => (
                  <th key={lo.id} className="px-3 py-3 text-center font-medium text-muted-foreground text-xs whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-default">
                            <span className="font-semibold text-ink">{lo.code}</span>
                            <span className="block text-[10px] font-normal text-muted-foreground max-w-[80px] truncate">{lo.label}</span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{lo.label}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.students.map(s => (
                <tr key={s.studentId} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium text-ink whitespace-nowrap">{s.studentName}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{studentMap.get(s.studentId)?.studentNo ?? '—'}</td>
                  {los.map(lo => {
                    const loScore = s.loScores.find(l => l.loId === lo.id)?.score ?? null
                    return <AttainCell key={lo.id} score={loScore} />
                  })}
                </tr>
              ))}
              {/* Class average row */}
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td className="px-4 py-2 font-semibold text-primary text-xs">Sınıf Ort.</td>
                <td className="px-4 py-2" />
                {los.map(lo => {
                  const scores = result.students
                    .map(s => s.loScores.find(l => l.loId === lo.id)?.score ?? null)
                    .filter((v): v is number => v !== null)
                  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
                  return <AvgCell key={lo.id} score={avg} />
                })}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Assessment items management */}
      <CourseItemsClient courseId={course.id} items={items} />

      {/* Assessment item → LO mapping (editable) */}
      <LOMapClient
        courseId={course.id}
        allItems={items}
        loGroups={los.map(lo => ({
          lo,
          loItems: lo.itemWeights
            .map(iw => ({ item: items.find(i => i.id === iw.itemId)!, weight: iw.weight }))
            .filter(x => x.item),
        }))}
      />
    </div>
  )
}
