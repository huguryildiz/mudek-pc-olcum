'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Check, Trash2, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AssessmentItem } from '@/lib/types'
import { addAssessmentItem, updateAssessmentItem, deleteAssessmentItem, updateGroupLabel } from './actions'

interface Props {
  courseId: string
  items: AssessmentItem[]
}

function ItemChip({
  item,
  onUpdated,
  onDeleted,
}: {
  item: AssessmentItem
  onUpdated: (id: string, label: string, maxRaw: number) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [labelDraft, setLabelDraft] = useState(item.label)
  const [maxDraft, setMaxDraft] = useState(String(item.maxRaw))
  const [pending, startTransition] = useTransition()

  function startEdit() {
    setLabelDraft(item.label)
    setMaxDraft(String(item.maxRaw))
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
    setConfirmDelete(false)
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteAssessmentItem(item.id)
      onDeleted(item.id)
    })
  }

  function save() {
    const maxRaw = parseFloat(maxDraft)
    if (!labelDraft.trim() || isNaN(maxRaw) || maxRaw <= 0) return
    startTransition(async () => {
      await updateAssessmentItem(item.id, { label: labelDraft.trim(), maxRaw })
      onUpdated(item.id, labelDraft.trim(), maxRaw)
      setEditing(false)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <div className="inline-flex items-stretch rounded-lg border border-primary/40 overflow-hidden text-xs shadow-sm">
        <span className="px-2 py-1 bg-muted font-medium text-ink">{item.code}</span>
        <span className="w-px bg-border" />
        <input
          autoFocus
          value={labelDraft}
          onChange={e => setLabelDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-2 py-1 bg-background text-ink outline-none w-40 border-r border-border focus:bg-primary/[0.03]"
          placeholder="Açıklama"
        />
        <span className="w-px bg-border" />
        <div className="flex items-center gap-0.5 px-1.5 py-1 bg-background">
          <span className="text-[10px] text-muted-foreground font-mono">max</span>
          <input
            type="number"
            min={1}
            step={1}
            value={maxDraft}
            onChange={e => setMaxDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-12 bg-transparent text-center text-xs font-mono text-ink outline-none border-b border-primary/50 focus:border-primary"
          />
        </div>
        <span className="w-px bg-border" />
        <button
          onClick={save}
          disabled={pending}
          className="px-2 py-1 bg-background text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
          title="Kaydet"
        >
          <Check size={13} />
        </button>
        <button
          onClick={cancel}
          disabled={pending}
          className="px-2 py-1 bg-background text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors disabled:opacity-40"
          title="İptal"
        >
          <X size={13} />
        </button>
      </div>
    )
  }

  if (confirmDelete) {
    return (
      <div className="inline-flex items-stretch rounded-lg border border-red-300 overflow-hidden text-xs shadow-sm">
        <span className="px-2 py-1 bg-red-50 font-medium text-red-600">{item.code}</span>
        <span className="w-px bg-red-200" />
        <span className="px-2 py-1 bg-red-50 text-red-500">Silinsin mi?</span>
        <span className="w-px bg-red-200" />
        <button
          onClick={handleDelete}
          disabled={pending}
          className="px-2 py-1 bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-40"
        >
          Sil
        </button>
        <button
          onClick={() => setConfirmDelete(false)}
          disabled={pending}
          className="px-2 py-1 bg-red-50 text-red-400 hover:bg-red-100 transition-colors disabled:opacity-40"
        >
          <X size={11} />
        </button>
      </div>
    )
  }

  return (
    <div className="group inline-flex items-stretch rounded-lg border border-border overflow-hidden text-xs">
      <button
        onClick={startEdit}
        className="inline-flex items-stretch hover:bg-primary/[0.04] transition-colors cursor-text"
        title="Düzenle"
      >
        <span className="px-2 py-1 bg-muted font-medium text-ink">{item.code}</span>
        <span className="w-px bg-border" />
        <span className="px-2 py-1 bg-background text-muted-foreground">{item.label}</span>
        <span className="w-px bg-border" />
        <span className="px-2 py-1 bg-background font-mono text-muted-foreground tabular-nums">max {item.maxRaw}</span>
      </button>
      <button
        onClick={() => setConfirmDelete(true)}
        className="px-1.5 py-1 bg-background text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all border-l border-border"
        title="Sil"
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}

function QuickAddChip({
  courseId,
  groupCode,
  groupLabel,
  nextOrder,
  onAdded,
}: {
  courseId: string
  groupCode: string
  groupLabel: string
  nextOrder: number
  onAdded: (item: AssessmentItem) => void
}) {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [maxRaw, setMaxRaw] = useState('')
  const [pending, startTransition] = useTransition()

  function reset() {
    setCode('')
    setLabel('')
    setMaxRaw('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') reset()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const max = parseFloat(maxRaw)
    if (!code.trim() || !label.trim() || isNaN(max) || max <= 0) return
    startTransition(async () => {
      await addAssessmentItem(courseId, {
        code: code.trim().toUpperCase(),
        label: label.trim(),
        group: groupCode,
        groupLabel,
        maxRaw: max,
      })
      onAdded({
        id: `item-optimistic-${Date.now()}`,
        courseId,
        code: code.trim().toUpperCase(),
        label: label.trim(),
        group: groupCode,
        groupLabel,
        order: nextOrder,
        maxRaw: max,
        normFactor: max / 5,
      })
      reset()
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
      >
        <Plus size={11} />
        Ekle
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="inline-flex items-stretch rounded-lg border border-primary/40 overflow-hidden text-xs shadow-sm"
    >
      <input
        autoFocus
        value={code}
        onChange={e => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Kod"
        className="px-2 py-1 bg-muted font-medium text-ink w-20 outline-none placeholder:text-muted-foreground/50 focus:bg-primary/[0.04]"
      />
      <span className="w-px bg-border" />
      <input
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Açıklama"
        className="px-2 py-1 bg-background text-ink w-36 outline-none placeholder:text-muted-foreground/50 focus:bg-primary/[0.02]"
      />
      <span className="w-px bg-border" />
      <div className="flex items-center gap-0.5 px-1.5 py-1 bg-background">
        <span className="text-[10px] text-muted-foreground font-mono">max</span>
        <input
          type="number"
          min={1}
          step={1}
          value={maxRaw}
          onChange={e => setMaxRaw(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="25"
          className="w-12 bg-transparent text-center text-xs font-mono text-ink outline-none border-b border-primary/50 focus:border-primary placeholder:text-muted-foreground/50"
        />
      </div>
      <span className="w-px bg-border" />
      <button
        type="submit"
        disabled={pending}
        className="px-2 py-1 bg-background text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
        title="Ekle"
      >
        <Check size={13} />
      </button>
      <button
        type="button"
        onClick={reset}
        disabled={pending}
        className="px-2 py-1 bg-background text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors disabled:opacity-40"
        title="İptal"
      >
        <X size={13} />
      </button>
    </form>
  )
}

function GroupLabelEditor({
  courseId,
  groupCode,
  label,
  onSaved,
}: {
  courseId: string
  groupCode: string
  label: string
  onSaved: (groupCode: string, newLabel: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(label)
  const [pending, startTransition] = useTransition()

  function save() {
    if (!draft.trim()) return
    startTransition(async () => {
      await updateGroupLabel(courseId, groupCode, draft.trim())
      onSaved(groupCode, draft.trim())
      setEditing(false)
    })
  }

  function cancel() {
    setDraft(label)
    setEditing(false)
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1 mb-1.5">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
          className="text-[11px] font-semibold text-ink uppercase tracking-wide bg-transparent border-b border-primary outline-none w-40"
        />
        <span className="text-[11px] text-muted-foreground">({groupCode})</span>
        <button onClick={save} disabled={pending} className="text-emerald-600 hover:text-emerald-700 disabled:opacity-40">
          <Check size={11} />
        </button>
        <button onClick={cancel} disabled={pending} className="text-muted-foreground hover:text-red-500 disabled:opacity-40">
          <X size={11} />
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => { setDraft(label); setEditing(true) }}
      className="group/gl inline-flex items-center gap-1 mb-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-ink transition-colors cursor-text"
    >
      {label} ({groupCode})
      <Pencil size={10} className="opacity-0 group-hover/gl:opacity-60 transition-opacity" />
    </button>
  )
}

export default function CourseItemsClient({ courseId, items: initialItems }: Props) {
  const [items, setItems] = useState<AssessmentItem[]>(initialItems)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const groupMap: Record<string, { label: string; items: AssessmentItem[] }> = {}
  for (const item of items) {
    if (!groupMap[item.group]) groupMap[item.group] = { label: item.groupLabel, items: [] }
    groupMap[item.group].items.push(item)
  }
  const existingGroups = Object.entries(groupMap).map(([code, g]) => ({ code, label: g.label }))

  function handleUpdated(id: string, label: string, maxRaw: number) {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, label, maxRaw, normFactor: maxRaw / 5 } : i
    ))
  }

  function handleDeleted(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function handleAdded(item: AssessmentItem) {
    setItems(prev => [...prev, item])
  }

  function handleGroupLabelSaved(groupCode: string, newLabel: string) {
    setItems(prev => prev.map(i =>
      i.group === groupCode ? { ...i, groupLabel: newLabel } : i
    ))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Ölçüm Kalemleri</CardTitle>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Henüz ölçüm kalemi yok. "Ekle" ile başlayın.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupMap).map(([groupCode, group]) => (
              <div key={groupCode}>
                <GroupLabelEditor
                  courseId={courseId}
                  groupCode={groupCode}
                  label={group.label}
                  onSaved={handleGroupLabelSaved}
                />
                <div className="flex flex-wrap gap-1.5">
                  {group.items
                    .sort((a, b) => a.order - b.order)
                    .map(item => (
                      <ItemChip key={item.id} item={item} onUpdated={handleUpdated} onDeleted={handleDeleted} />
                    ))}
                  <QuickAddChip
                    courseId={courseId}
                    groupCode={groupCode}
                    groupLabel={group.label}
                    nextOrder={group.items.length + 1}
                    onAdded={handleAdded}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {showModal && (
        <AddItemModal
          courseId={courseId}
          existingGroups={existingGroups}
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </Card>
  )
}

function AddItemModal({
  courseId,
  existingGroups,
  onClose,
  onAdded,
}: {
  courseId: string
  existingGroups: { code: string; label: string }[]
  onClose: () => void
  onAdded: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [groupCode, setGroupCode] = useState('')
  const [groupLabel, setGroupLabel] = useState('')

  function handleGroupCodeChange(val: string) {
    const upper = val.toUpperCase()
    setGroupCode(upper)
    const existing = existingGroups.find(g => g.code === upper)
    if (existing) setGroupLabel(existing.label)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const maxRaw = parseFloat(fd.get('maxRaw') as string)
    startTransition(async () => {
      await addAssessmentItem(courseId, {
        code: (fd.get('code') as string).trim().toUpperCase(),
        label: fd.get('label') as string,
        group: groupCode,
        groupLabel,
        maxRaw,
      })
      onAdded()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ink">Yeni Ölçüm Kalemi</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="group">Grup Kodu</Label>
              <Input
                id="group"
                name="group"
                value={groupCode}
                onChange={e => handleGroupCodeChange(e.target.value)}
                placeholder="MT1"
                required
                list="group-suggestions"
              />
              <datalist id="group-suggestions">
                {existingGroups.map(g => (
                  <option key={g.code} value={g.code} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="groupLabel">Grup Adı</Label>
              <Input
                id="groupLabel"
                name="groupLabel"
                value={groupLabel}
                onChange={e => setGroupLabel(e.target.value)}
                placeholder="Vize Sınavı I"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Kalem Kodu</Label>
              <Input
                id="code"
                name="code"
                placeholder="MT1-S1"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxRaw">Maks. Puan</Label>
              <Input
                id="maxRaw"
                name="maxRaw"
                type="number"
                min={1}
                step={1}
                placeholder="25"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="label">Kalem Açıklaması</Label>
            <Input
              id="label"
              name="label"
              placeholder="Vize 1 – Soru 1"
              required
            />
          </div>

          <p className="text-xs text-muted-foreground">
            normFactor = maks. puan / 5 olarak otomatik hesaplanır (0–5 ölçeği)
          </p>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" className="flex-1" disabled={pending}>
              {pending ? 'Kaydediliyor…' : 'Ekle'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
