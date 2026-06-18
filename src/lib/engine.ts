// ────────────────────────────────────────────────────────
// Pure-function calculation engine
// NULL semantics: null means unmeasured; excluded from weighted avg
// Engine never returns NaN; returns null instead
// ────────────────────────────────────────────────────────

import type {
  AssessmentItem,
  LODefinition,
  CourseStudentResult,
  CourseResult,
  ProgramPOResult,
  PO_ID,
  EvidenceFile,
  POEvidenceTree,
  POEvidenceCourseNode,
  POEvidenceLONode,
  POEvidenceItemNode,
} from './types'
import { ALL_POS } from './types'
import type { Course, Student, Enrollment, Score, CurriculumMapEntry } from './types'

// ── Normalize raw score to 0-5 scale ────────────────────
export function normScore(item: AssessmentItem, raw: number | null): number | null {
  if (raw === null) return null
  return raw / item.normFactor
}

// ── Learning Outcome score for one student ───────────────
// LO(j,s) = Σ(w_i * norm_i) / Σ(w_i) for measured items
// If all items are null → null (LO is unmeasured)
export function loScore(
  lo: LODefinition,
  itemMap: Map<string, AssessmentItem>,
  scoreMap: Map<string, number | null>,  // itemId → raw
): number | null {
  let numerator = 0
  let denominator = 0
  for (const { itemId, weight } of lo.itemWeights) {
    const item = itemMap.get(itemId)
    if (!item) continue
    const raw = scoreMap.has(itemId) ? scoreMap.get(itemId)! : null
    const norm = normScore(item, raw)
    if (norm === null) continue  // unmeasured: excluded
    numerator += weight * norm
    denominator += weight
  }
  if (denominator === 0) return null
  return numerator / denominator
}

// ── PO score for one student in one course ───────────────
// PO(k,s) = Σ(c(j,k) * LO(j,s)) / Σ(c(j,k)) where c>0 and LO measured
export function poScoreForStudent(
  los: LODefinition[],
  loScores: Map<string, number | null>,  // loId → score
): Record<PO_ID, number | null> {
  const result = {} as Record<PO_ID, number | null>
  for (const poId of ALL_POS) {
    let numerator = 0
    let denominator = 0
    for (const lo of los) {
      const contrib = (lo.poContributions ?? []).find(c => c.poId === poId)
      if (!contrib || contrib.weight === 0) continue
      const loVal = loScores.get(lo.id)
      if (loVal === null || loVal === undefined) continue  // null LO excluded
      numerator += contrib.weight * loVal
      denominator += contrib.weight
    }
    result[poId] = denominator > 0 ? numerator / denominator : null
  }
  return result
}

// ── Course-level computation ──────────────────────────────
export function computeCourseResult(
  course: Course,
  items: AssessmentItem[],
  los: LODefinition[],
  enrollments: Enrollment[],
  allScores: Score[],
  studentMap: Map<string, Student>,
): CourseResult {
  const itemMap = new Map(items.map(i => [i.id, i]))
  const courseEnrollments = enrollments.filter(e => e.courseId === course.id)

  const students: CourseStudentResult[] = []
  for (const enrollment of courseEnrollments) {
    const student = studentMap.get(enrollment.studentId)
    if (!student) continue

    // Build scoreMap for this enrollment
    const scoreMap = new Map<string, number | null>()
    for (const s of allScores) {
      if (s.enrollmentId === enrollment.id) {
        scoreMap.set(s.itemId, s.raw)
      }
    }

    // Compute LO scores
    const loScoreMap = new Map<string, number | null>()
    const loResults = los.map(lo => {
      const score = loScore(lo, itemMap, scoreMap)
      loScoreMap.set(lo.id, score)
      return { loId: lo.id, loCode: lo.code, score }
    })

    // Compute PO scores
    const poScoreMap = poScoreForStudent(los, loScoreMap)
    const poResults = ALL_POS.map(poId => ({
      poId,
      score: poScoreMap[poId],
    }))

    students.push({
      enrollmentId: enrollment.id,
      studentId: student.id,
      studentName: student.name,
      loScores: loResults,
      poScores: poResults,
    })
  }

  // Course-level PO average: avg across students (null students excluded)
  const coursePOAvg = {} as Record<PO_ID, number | null>
  for (const poId of ALL_POS) {
    const vals = students
      .map(s => s.poScores.find(p => p.poId === poId)?.score ?? null)
      .filter((v): v is number => v !== null)
    coursePOAvg[poId] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  return { courseId: course.id, students, coursePOAvg }
}

// ── PÇ → Soru izlenebilirliği (kanıt türetme) ────────────
// Bir PÇ'ye katkı veren (weight>0) ÖÇ'lerin tüm itemWeights itemId'leri.
export function itemIdsForPO(poId: PO_ID, los: LODefinition[]): Set<string> {
  const ids = new Set<string>()
  for (const lo of los) {
    const contrib = (lo.poContributions ?? []).find(c => c.poId === poId)
    if (!contrib || contrib.weight === 0) continue
    for (const { itemId } of lo.itemWeights) ids.add(itemId)
  }
  return ids
}

// ── PÇ kanıt ağacı: Ders → ÖÇ → Soru → kanıt dosyaları ───
// Yalnızca poId'ye katkı veren ÖÇ'ler ve kanıtı olan dallar döner.
// Bir dosya ancak kendi courseId'si ve bağlı itemId'si eşleşen dalda görünür.
export function buildPOEvidenceTree(
  poId: PO_ID,
  courses: Course[],
  los: LODefinition[],
  items: AssessmentItem[],
  evidenceFiles: EvidenceFile[],
): POEvidenceTree {
  const itemMap = new Map(items.map(i => [i.id, i]))
  const uniqueFileIds = new Set<string>()
  const courseNodes: POEvidenceCourseNode[] = []

  for (const course of courses) {
    const courseLos = los.filter(
      lo => lo.courseId === course.id &&
        (lo.poContributions ?? []).some(c => c.poId === poId && c.weight !== 0),
    )

    const loNodes: POEvidenceLONode[] = []
    for (const lo of courseLos) {
      const itemNodes: POEvidenceItemNode[] = []
      for (const { itemId } of lo.itemWeights) {
        const files = evidenceFiles.filter(
          f => f.courseId === course.id && (f.itemIds ?? []).includes(itemId),
        )
        if (files.length === 0) continue
        const item = itemMap.get(itemId)
        itemNodes.push({
          itemId,
          itemCode: item?.code ?? itemId,
          itemLabel: item?.label ?? itemId,
          files,
        })
        for (const f of files) uniqueFileIds.add(f.id)
      }
      if (itemNodes.length > 0) {
        loNodes.push({ loId: lo.id, loCode: lo.code, loLabel: lo.label, items: itemNodes })
      }
    }

    if (loNodes.length > 0) {
      courseNodes.push({
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        los: loNodes,
      })
    }
  }

  return { poId, courses: courseNodes, totalFiles: uniqueFileIds.size }
}

// ── Program-level PO (student-centric, Ek-2) ─────────────
// For each student: PO_student(k,s) = Σ(a(d,k)*PO_course(d,k,s)) / Σa(d,k)
// Then PO_program(k) = avg_s PO_student(k,s)
export function computeProgramPO(
  courseResults: CourseResult[],
  courses: Course[],
  curriculumMap: CurriculumMapEntry[],
  studentMap: Map<string, Student>,
): ProgramPOResult[] {
  const courseMap = new Map(courses.map(c => [c.id, c]))

  // Collect all student IDs across all courses
  const allStudentIds = new Set<string>()
  for (const cr of courseResults) {
    for (const s of cr.students) {
      allStudentIds.add(s.studentId)
    }
  }

  const results: ProgramPOResult[] = []
  for (const poId of ALL_POS) {
    const studentScores: { studentId: string; studentName: string; score: number | null }[] = []

    for (const studentId of allStudentIds) {
      const student = studentMap.get(studentId)
      if (!student) continue

      let numerator = 0
      let denominator = 0
      for (const cr of courseResults) {
        const course = courseMap.get(cr.courseId)
        if (!course) continue
        const entry = curriculumMap.find(m => m.courseCode === course.code)
        const courseWeight = entry?.poWeights[poId] ?? 0
        if (courseWeight === 0) continue

        const studentResult = cr.students.find(s => s.studentId === studentId)
        if (!studentResult) continue

        const poScore = studentResult.poScores.find(p => p.poId === poId)?.score ?? null
        if (poScore === null) continue  // null excluded

        numerator += courseWeight * poScore
        denominator += courseWeight
      }

      studentScores.push({
        studentId,
        studentName: student.name,
        score: denominator > 0 ? numerator / denominator : null,
      })
    }

    const programVals = studentScores
      .map(s => s.score)
      .filter((v): v is number => v !== null)

    results.push({
      poId,
      studentScores,
      programAvg: programVals.length > 0
        ? programVals.reduce((a, b) => a + b, 0) / programVals.length
        : null,
    })
  }

  return results
}
