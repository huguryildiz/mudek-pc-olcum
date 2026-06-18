'use server'

import { getStore, updateLODefinition, persist } from '@/lib/store'
import type { PO_ID } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function saveLOLabel(loId: string, label: string) {
  updateLODefinition(loId, { label: label.trim() || '—' })
}

export async function saveItemWeight(loId: string, itemId: string, weight: number) {
  const lo = getStore().loDefinitions.find(l => l.id === loId)
  if (!lo) return
  if (weight === 0) {
    lo.itemWeights = lo.itemWeights.filter(w => w.itemId !== itemId)
  } else {
    const iw = lo.itemWeights.find(w => w.itemId === itemId)
    if (iw) {
      iw.weight = weight
    } else {
      lo.itemWeights.push({ itemId, weight })
    }
  }
  updateLODefinition(loId, { itemWeights: lo.itemWeights })
}

export async function savePOContribution(loId: string, poId: PO_ID, weight: number) {
  const lo = getStore().loDefinitions.find(l => l.id === loId)
  if (!lo) return
  if (weight === 0) {
    lo.poContributions = (lo.poContributions ?? []).filter(c => c.poId !== poId)
  } else {
    const pc = (lo.poContributions ?? []).find(c => c.poId === poId)
    if (pc) {
      pc.weight = weight
    } else {
      lo.poContributions = lo.poContributions ?? []
      lo.poContributions.push({ poId, weight })
    }
  }
  updateLODefinition(loId, { poContributions: lo.poContributions })
}

export async function addAssessmentItem(courseId: string, data: {
  code: string
  label: string
  group: string
  groupLabel: string
  maxRaw: number
}) {
  const store = getStore()
  const sameGroup = store.assessmentItems.filter(i => i.courseId === courseId && i.group === data.group)
  const id = `item-${Date.now()}`
  store.assessmentItems.push({
    id,
    courseId,
    code: data.code.trim(),
    label: data.label.trim(),
    group: data.group.trim().toUpperCase(),
    groupLabel: data.groupLabel.trim(),
    order: sameGroup.length + 1,
    normFactor: data.maxRaw / 5,
    maxRaw: data.maxRaw,
  })
  persist()
  revalidatePath(`/dersler/${courseId}`)
}

export async function updateAssessmentItem(itemId: string, data: { label: string; maxRaw: number }) {
  const store = getStore()
  const item = store.assessmentItems.find(i => i.id === itemId)
  if (!item) return
  item.label = data.label.trim()
  item.maxRaw = data.maxRaw
  item.normFactor = data.maxRaw / 5
  persist()
  revalidatePath(`/dersler/${item.courseId}`)
}

export async function deleteAssessmentItem(itemId: string) {
  const store = getStore()
  const item = store.assessmentItems.find(i => i.id === itemId)
  if (!item) return
  const courseId = item.courseId
  store.assessmentItems = store.assessmentItems.filter(i => i.id !== itemId)
  // Clean up orphaned LO itemWeights
  for (const lo of store.loDefinitions) {
    lo.itemWeights = lo.itemWeights.filter(w => w.itemId !== itemId)
  }
  // Clean up scores for this item
  store.scores = store.scores.filter(s => s.itemId !== itemId)
  persist()
  revalidatePath(`/dersler/${courseId}`)
}

export async function updateGroupLabel(courseId: string, groupCode: string, groupLabel: string) {
  const store = getStore()
  for (const item of store.assessmentItems) {
    if (item.courseId === courseId && item.group === groupCode) {
      item.groupLabel = groupLabel.trim()
    }
  }
  persist()
  revalidatePath(`/dersler/${courseId}`)
}

export async function addLODefinition(courseId: string, data: {
  code: string
  label: string
}) {
  const store = getStore()
  const id = `lo-${courseId}-${Date.now()}`
  store.loDefinitions.push({
    id,
    courseId,
    code: data.code.trim(),
    label: data.label.trim(),
    itemWeights: [],
    poContributions: [],
  })
  persist()
  revalidatePath(`/dersler/${courseId}`)
}
