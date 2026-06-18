import { describe, it, expect } from 'vitest'
import { createSeedData } from '@/lib/seed'
import { computeCourseResult, computeProgramPO, loScore } from '@/lib/engine'
import { round } from '@/lib/utils'
import type { StoreData } from '@/lib/store'

// ── helpers ──────────────────────────────────────────────────────────────────

function buildMaps(store: StoreData) {
  const studentMap = new Map(store.students.map(s => [s.id, s]))
  return { studentMap }
}

function getLoScore(
  store: StoreData,
  courseResult: ReturnType<typeof computeCourseResult>,
  studentId: string,
  loCode: string,
) {
  const student = courseResult.students.find(s => s.studentId === studentId)
  if (!student) return null
  const lo = student.loScores.find(l => {
    const def = store.loDefinitions.find(d => d.id === l.loId)
    return def?.code === loCode
  })
  return lo?.score ?? null
}

function getPOScore(
  courseResult: ReturnType<typeof computeCourseResult>,
  studentId: string,
  poId: string,
) {
  const student = courseResult.students.find(s => s.studentId === studentId)
  return student?.poScores.find(p => p.poId === poId)?.score ?? null
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('Engine golden test (seed data)', () => {
  const store = createSeedData()
  const { studentMap } = buildMaps(store)

  const ee311 = store.courses.find(c => c.code === 'EE311')!
  const ee492 = store.courses.find(c => c.code === 'EE492')!

  const ee311Items = store.assessmentItems.filter(i => i.courseId === ee311.id)
  const ee311LOs = store.loDefinitions.filter(lo => lo.courseId === ee311.id)
  const ee311Enrollments = store.enrollments.filter(e => e.courseId === ee311.id)
  const ee311Result = computeCourseResult(ee311, ee311Items, ee311LOs, ee311Enrollments, store.scores, studentMap)

  const ee492Items = store.assessmentItems.filter(i => i.courseId === ee492.id)
  const ee492LOs = store.loDefinitions.filter(lo => lo.courseId === ee492.id)
  const ee492Enrollments = store.enrollments.filter(e => e.courseId === ee492.id)
  const ee492Result = computeCourseResult(ee492, ee492Items, ee492LOs, ee492Enrollments, store.scores, studentMap)

  // ── NULL semantics ────────────────────────────────────────────────────────

  it('NULL semantics: Selin Şahin ALE-3=null causes LO-5 to use only FinalQ3', () => {
    // Selin has ALE-3=null, FN-Q3=14
    // LO-5 = [ALE3(5) + FNQ3(8.75)] / (5+8.75) → ALE3 null → excluded
    // LO-5 = [8.75*(14/5)] / 8.75 = 14/5 = 2.8
    const lo5 = getLoScore(store, ee311Result, 's5', 'ÖÇ-5')
    expect(lo5).not.toBeNull()
    expect(round(lo5!, 4)).toBe(round(14 / 5, 4))
  })

  it('NULL semantics: Selin Şahin MT2-Q3=null causes LO-4 to exclude that item', () => {
    // Selin: ALE2=70, MT2Q3=null, MT2Q4=16, FNQ2=15
    // LO-4: [ALE2(5)+MT2Q3(6.25)+MT2Q4(6.25)+FNQ2(8.75)]
    // MT2Q3 null → excluded: [5*(70/20) + 6.25*(16/5) + 8.75*(15/5)] / (5+6.25+8.75)
    // = [5*3.5 + 6.25*3.2 + 8.75*3.0] / 20
    // = [17.5 + 20 + 26.25] / 20
    // = 63.75 / 20 = 3.1875
    const lo4 = getLoScore(store, ee311Result, 's5', 'ÖÇ-4')
    expect(round(lo4!, 4)).toBe(round(63.75 / 20, 4))
  })

  it('NULL: student with all nulls for an LO returns null (not 0)', () => {
    const lo = ee311LOs[0]
    const itemMap = new Map(ee311Items.map(i => [i.id, i]))
    const emptyScoreMap = new Map<string, number | null>()
    const result = loScore(lo, itemMap, emptyScoreMap)
    expect(result).toBeNull()
  })

  // ── EE311 spot checks ─────────────────────────────────────────────────────

  it('EE311 Elif LO-1: [5*(90/20)+6.25*(22/5)+6.25*(20/5)+8.75*(22/5)] / 26.25', () => {
    const expected = (5 * (90 / 20) + 6.25 * (22 / 5) + 6.25 * (20 / 5) + 8.75 * (22 / 5)) / 26.25
    const actual = getLoScore(store, ee311Result, 's1', 'ÖÇ-1')
    expect(round(actual!, 6)).toBe(round(expected, 6))
  })

  it('EE311 Elif LO-5: [5*(95/20)+8.75*(23/5)] / 13.75', () => {
    const expected = (5 * (95 / 20) + 8.75 * (23 / 5)) / 13.75
    const actual = getLoScore(store, ee311Result, 's1', 'ÖÇ-5')
    expect(round(actual!, 6)).toBe(round(expected, 6))
  })

  it('EE311 all LOs map to PO-1, PO-2, PO-4 with equal contrib → same course PO avg', () => {
    const po1 = ee311Result.coursePOAvg['PO-1']
    const po2 = ee311Result.coursePOAvg['PO-2']
    expect(po1).not.toBeNull()
    // PO-1 and PO-2 both have weight 1 on all 6 LOs → they should be equal
    expect(round(po1!, 6)).toBe(round(po2!, 6))
  })

  it('EE311 PO-4 != null (all LOs contribute with weight 0.5)', () => {
    expect(ee311Result.coursePOAvg['PO-4']).not.toBeNull()
  })

  it('EE311 PO-3, PO-5..11 (except PO-4) are null (not measured by EE311)', () => {
    for (const po of ['PO-3', 'PO-5', 'PO-6', 'PO-7', 'PO-8', 'PO-9', 'PO-10', 'PO-11'] as const) {
      expect(ee311Result.coursePOAvg[po]).toBeNull()
    }
  })

  // ── EE492 spot checks ─────────────────────────────────────────────────────

  it('EE492 Elif LO-1: ir-proto/10 = 44/10 = 4.4', () => {
    const actual = getLoScore(store, ee492Result, 's1', 'ÖÇ-1')
    expect(round(actual!, 4)).toBe(4.4)
  })

  it('EE492 Elif LO-4: (0.25*(90/20) + 0.45*(87/20)) / 0.70', () => {
    const expected = (0.25 * (90 / 20) + 0.45 * (87 / 20)) / 0.70
    const actual = getLoScore(store, ee492Result, 's1', 'ÖÇ-4')
    expect(round(actual!, 6)).toBe(round(expected, 6))
  })

  it('EE492 Elif LO-5: pp/20 = 88/20 = 4.4', () => {
    const actual = getLoScore(store, ee492Result, 's1', 'ÖÇ-5')
    expect(round(actual!, 4)).toBe(4.4)
  })

  it('EE492 Elif LO-6: fr-team/3 = 14/3 ≈ 4.667', () => {
    const expected = 14 / 3
    const actual = getLoScore(store, ee492Result, 's1', 'ÖÇ-6')
    expect(round(actual!, 4)).toBe(round(expected, 4))
  })

  it('EE492 PO-9 measured (LO-5 and LO-6 both contribute)', () => {
    expect(ee492Result.coursePOAvg['PO-9']).not.toBeNull()
  })

  it('EE492 PO-10 is not null (LO-4 maps to it)', () => {
    expect(ee492Result.coursePOAvg['PO-10']).not.toBeNull()
  })

  // ── Program PO (Ek-2) ─────────────────────────────────────────────────────

  it('Program PO-1 aggregates from both EE311 and EE492 with curriculum weights', () => {
    const program = store.programs[0]
    const programPO = computeProgramPO(
      [ee311Result, ee492Result],
      store.courses,
      program.curriculumMap,
      studentMap,
    )
    const po1 = programPO.find(p => p.poId === 'PO-1')
    expect(po1?.programAvg).not.toBeNull()
    // Should be a weighted combination of EE311 PO-1 (w=1) and EE492 PO-1 (w=1)
    // For Elif: (1*EE311_PO1 + 1*EE492_PO1) / 2
    const elif311PO1 = getPOScore(ee311Result, 's1', 'PO-1')!
    const elif492PO1 = getPOScore(ee492Result, 's1', 'PO-1')!
    const expectedElif = (1 * elif311PO1 + 1 * elif492PO1) / 2
    const elifEntry = po1!.studentScores.find(s => s.studentId === 's1')
    expect(round(elifEntry!.score!, 6)).toBe(round(expectedElif, 6))
  })

  it('Program PO-9 comes only from EE492 (EE311 has no PO-9)', () => {
    const program = store.programs[0]
    const programPO = computeProgramPO(
      [ee311Result, ee492Result],
      store.courses,
      program.curriculumMap,
      studentMap,
    )
    const po9 = programPO.find(p => p.poId === 'PO-9')
    expect(po9?.programAvg).not.toBeNull()
    // For Elif, program PO-9 = EE492 PO-9 (because EE311 weight for PO-9 = 0)
    const elifCourse492PO9 = getPOScore(ee492Result, 's1', 'PO-9')!
    const elifProgramPO9 = po9!.studentScores.find(s => s.studentId === 's1')!.score!
    expect(round(elifProgramPO9, 6)).toBe(round(elifCourse492PO9, 6))
  })

  it('Program PO-3 is null (EE311 does not measure it; EE492 does with weight 1)', () => {
    const program = store.programs[0]
    const programPO = computeProgramPO(
      [ee311Result, ee492Result],
      store.courses,
      program.curriculumMap,
      studentMap,
    )
    const po3 = programPO.find(p => p.poId === 'PO-3')
    // EE492 measures PO-3 with weight 1 in curriculum map → should not be null
    expect(po3?.programAvg).not.toBeNull()
  })
})
