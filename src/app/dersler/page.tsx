import { getStore, getStudentMap } from '@/lib/store'
import { computeCourseResult } from '@/lib/engine'
import { attainmentLevel, ALL_POS } from '@/lib/types'
import { formatScore, poDisplayId } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Users, ChevronRight } from 'lucide-react'
import { NewCourseModal } from './NewCourseModal'

export default function CoursesPage() {
  const store = getStore()
  const studentMap = getStudentMap()

  const courseResults = store.courses.map(course => {
    const items = store.assessmentItems.filter(i => i.courseId === course.id)
    const los = store.loDefinitions.filter(lo => lo.courseId === course.id)
    const enrollments = store.enrollments.filter(e => e.courseId === course.id)
    return {
      course,
      result: computeCourseResult(course, items, los, enrollments, store.scores, studentMap),
      items,
      los,
      enrollments,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dersler</h1>
          <p className="text-muted-foreground mt-1">
            Ders öğrenme çıktıları ve not girişi
          </p>
        </div>
        <NewCourseModal />
      </div>

      <div className="grid gap-4">
        {courseResults.map(({ course, result, items, los, enrollments }) => {
          const measuredPOs = ALL_POS.filter(poId => result.coursePOAvg[poId] !== null)
          const abovePOs = measuredPOs.filter(poId => attainmentLevel(result.coursePOAvg[poId]) === 'above').length
          const belowPOs = measuredPOs.filter(poId => attainmentLevel(result.coursePOAvg[poId]) === 'below').length

          return (
            <Card key={course.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-ink">{course.code}</h2>
                        <Badge variant="outline">{course.semester}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{course.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {course.instructors.join(', ')}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {enrollments.length} öğrenci
                        </span>
                        <span>{items.length} ölçüm kalemi</span>
                        <span>{los.length} öğrenme çıktısı</span>
                        <span className="flex items-center gap-1">
                          <span className="text-attainment-above font-medium">{abovePOs} PÇ hedefte</span>
                          {belowPOs > 0 && (
                            <span className="text-attainment-below font-medium ml-1">{belowPOs} yetersiz</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dersler/${course.id}/notlar`}
                      className="text-sm px-4 py-3 rounded-md border border-border hover:bg-muted transition-colors text-ink"
                    >
                      Not Girişi
                    </Link>
                    <Link
                      href={`/dersler/${course.id}`}
                      className="inline-flex items-center text-sm px-4 py-3 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      Detay
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Mini PO attainment bar */}
                <div className="mt-4 flex gap-1">
                  {ALL_POS.map(poId => {
                    const score = result.coursePOAvg[poId]
                    const level = attainmentLevel(score)
                    const colorClass = {
                      above: 'bg-attainment-above',
                      border: 'bg-attainment-border',
                      below: 'bg-attainment-below',
                      unmeasured: 'bg-border',
                    }[level]
                    return (
                      <div
                        key={poId}
                        title={`${poDisplayId(poId)}: ${formatScore(score)}`}
                        className={`flex-1 h-2 rounded-full ${colorClass}`}
                      />
                    )
                  })}
                </div>
                <div className="mt-1 hidden sm:grid text-xs text-muted-foreground" style={{ gridTemplateColumns: 'repeat(11, 1fr)' }}>
                  {ALL_POS.map((poId, i) => {
                    const num = i + 1
                    const isOdd = num % 2 === 1
                    return (
                      <span key={poId} className={`${i === 10 ? 'text-right' : i > 0 && i < 10 ? 'text-center' : ''} ${isOdd ? '' : 'invisible'}`}>
                        {isOdd ? `PÇ-${num}` : ''}
                      </span>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
