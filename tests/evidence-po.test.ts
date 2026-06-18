import { describe, it, expect } from 'vitest'
import { createSeedData } from '@/lib/seed'
import { itemIdsForPO, buildPOEvidenceTree } from '@/lib/engine'
import type { EvidenceFile } from '@/lib/types'

const store = createSeedData()
const ee311 = store.courses.find(c => c.code === 'EE311')!
const ee492 = store.courses.find(c => c.code === 'EE492')!
const ee311LOs = store.loDefinitions.filter(lo => lo.courseId === ee311.id)
const ee492LOs = store.loDefinitions.filter(lo => lo.courseId === ee492.id)

function makeFile(id: string, courseId: string, itemIds: string[]): EvidenceFile {
  return {
    id,
    courseId,
    originalName: `${id}.pdf`,
    storedName: `${id}.PDF`,
    category: 'PÇ Kanıtları',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    uploadedAt: '2026-06-18T00:00:00.000Z',
    itemIds,
  }
}

// ── itemIdsForPO ───────────────────────────────────────────────────────────────

describe('itemIdsForPO', () => {
  it('EE311: all 6 LOs map to PO-1 → union covers all 15 EE311 items', () => {
    const result = itemIdsForPO('PO-1', ee311LOs)
    const allEe311ItemIds = store.assessmentItems
      .filter(i => i.courseId === ee311.id)
      .map(i => i.id)
    expect(result).toEqual(new Set(allEe311ItemIds))
    expect(result.size).toBe(15)
  })

  it('EE492: PO-9 comes only from ÖÇ-5 (pp) and ÖÇ-6 (fr-team)', () => {
    const result = itemIdsForPO('PO-9', ee492LOs)
    expect(result).toEqual(new Set(['ee492-pp', 'ee492-fr-team']))
  })

  it('EE311 does not contribute to PO-3 → empty set', () => {
    expect(itemIdsForPO('PO-3', ee311LOs)).toEqual(new Set())
  })

  it('excludes contributions with weight 0', () => {
    const los = [
      {
        id: 'lo-x', courseId: 'c', code: 'ÖÇ-X', label: '',
        itemWeights: [{ itemId: 'it-1', weight: 1 }],
        poContributions: [{ poId: 'PO-1' as const, weight: 0 }],
      },
    ]
    expect(itemIdsForPO('PO-1', los)).toEqual(new Set())
  })
})

// ── buildPOEvidenceTree ────────────────────────────────────────────────────────

describe('buildPOEvidenceTree', () => {
  const items = store.assessmentItems

  it('places a file under the right Course → ÖÇ → Soru for its PO', () => {
    const file = makeFile('ev-pp', ee492.id, ['ee492-pp'])
    const tree = buildPOEvidenceTree('PO-9', store.courses, store.loDefinitions, items, [file])

    expect(tree.totalFiles).toBe(1)
    expect(tree.courses).toHaveLength(1)
    expect(tree.courses[0].courseCode).toBe('EE492')
    const lo = tree.courses[0].los.find(l => l.loCode === 'ÖÇ-5')!
    expect(lo).toBeTruthy()
    const item = lo.items.find(i => i.itemId === 'ee492-pp')!
    expect(item.files.map(f => f.id)).toEqual(['ev-pp'])
  })

  it('counts a file once even if it appears under multiple ÖÇ (shared item)', () => {
    // ee311-ale1 belongs to both ÖÇ-1 and ÖÇ-2, both contributing to PO-1
    const file = makeFile('ev-ale1', ee311.id, ['ee311-ale1'])
    const tree = buildPOEvidenceTree('PO-1', store.courses, store.loDefinitions, items, [file])

    expect(tree.totalFiles).toBe(1)
    const lo1 = tree.courses[0].los.find(l => l.loCode === 'ÖÇ-1')!
    const lo2 = tree.courses[0].los.find(l => l.loCode === 'ÖÇ-2')!
    expect(lo1.items.some(i => i.files.some(f => f.id === 'ev-ale1'))).toBe(true)
    expect(lo2.items.some(i => i.files.some(f => f.id === 'ev-ale1'))).toBe(true)
  })

  it('a file with no itemIds is never shown under any PO', () => {
    const file = makeFile('ev-loose', ee311.id, [])
    const tree = buildPOEvidenceTree('PO-1', store.courses, store.loDefinitions, items, [file])
    expect(tree.totalFiles).toBe(0)
    expect(tree.courses).toHaveLength(0)
  })

  it('prunes courses/ÖÇ/Soru branches that have no evidence', () => {
    const file = makeFile('ev-pp', ee492.id, ['ee492-pp'])
    const tree = buildPOEvidenceTree('PO-9', store.courses, store.loDefinitions, items, [file])
    // Only the branch with the file survives: 1 course, 1 ÖÇ, 1 Soru
    expect(tree.courses).toHaveLength(1)
    expect(tree.courses[0].los).toHaveLength(1)
    expect(tree.courses[0].los[0].items).toHaveLength(1)
  })

  it('a file is only matched within its own course', () => {
    // itemId belongs to EE492, but file is mislabeled to EE311 course → no match
    const file = makeFile('ev-mismatch', ee311.id, ['ee492-pp'])
    const tree = buildPOEvidenceTree('PO-9', store.courses, store.loDefinitions, items, [file])
    expect(tree.totalFiles).toBe(0)
  })
})
