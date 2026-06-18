'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AssessmentItem, LODefinition, PO_ID } from '@/lib/types'
import { ALL_POS, PO_LABELS, PO_DESCRIPTIONS } from '@/lib/types'
import { saveLOLabel, saveItemWeight, savePOContribution, addLODefinition } from './actions'
import { poDisplayId } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface LOGroup {
  lo: LODefinition
  loItems: { item: AssessmentItem; weight: number }[]
}

const WEIGHT_STEPS = [0, 0.25, 0.5, 0.75, 1]

// ── PÇ × ÖÇ Matrix ────────────────────────────────────────────────────────────

function LOPOMatrix({
  groups,
  onCellChange,
}: {
  groups: LOGroup[]
  onCellChange: (loId: string, poId: PO_ID, weight: number) => void
}) {
  const [weights, setWeights] = useState<Record<string, Record<string, number>>>(() =>
    Object.fromEntries(
      groups.map(g => [
        g.lo.id,
        Object.fromEntries((g.lo.poContributions ?? []).map(c => [c.poId, c.weight])),
      ])
    )
  )
  const [pending, startTransition] = useTransition()

  const loKey = groups.map(g => g.lo.id).join(',')
  const prevKey = useRef(loKey)
  if (prevKey.current !== loKey) {
    prevKey.current = loKey
    setWeights(
      Object.fromEntries(
        groups.map(g => [
          g.lo.id,
          Object.fromEntries((g.lo.poContributions ?? []).map(c => [c.poId, c.weight])),
        ])
      )
    )
  }

  function handleClick(loId: string, poId: PO_ID) {
    const current = weights[loId]?.[poId] ?? 0
    const idx = WEIGHT_STEPS.indexOf(current)
    const next = WEIGHT_STEPS[(idx + 1) % WEIGHT_STEPS.length]

    setWeights(prev => ({
      ...prev,
      [loId]: { ...prev[loId], [poId]: next },
    }))

    startTransition(async () => {
      await savePOContribution(loId, poId, next)
      onCellChange(loId, poId, next)
    })
  }

  if (groups.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>ÖÇ → PÇ Katkı Matrisi</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Hücreye tıklayarak katkı değerini döngüsel olarak değiştirin: — → 25% → 50% → 75% → 100% → —
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-3 pr-4 text-xs font-semibold text-muted-foreground w-56 min-w-56">
                  Program Çıktısı
                </th>
                <TooltipProvider>
                  {groups.map(g => (
                    <th key={g.lo.id} className="pb-3 px-2 text-center min-w-[4.5rem]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground cursor-default">
                            {g.lo.code}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{g.lo.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </th>
                  ))}
                </TooltipProvider>
              </tr>
            </thead>
            <tbody>
              <TooltipProvider>
                {ALL_POS.map((poId, rowIdx) => (
                  <tr
                    key={poId}
                    className={`border-b border-border/40 ${rowIdx % 2 !== 0 ? 'bg-muted/20' : ''}`}
                  >
                    <td className="py-2 pr-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1.5 cursor-default">
                            <span className="text-xs font-semibold text-primary shrink-0">
                              {poDisplayId(poId)}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[10rem]">
                              {PO_LABELS[poId]}
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold mb-0.5">{PO_LABELS[poId]}</p>
                          <p className="max-w-xs">{PO_DESCRIPTIONS[poId]}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    {groups.map(g => {
                      const w = weights[g.lo.id]?.[poId] ?? 0
                      const pct = Math.round(w * 100)
                      return (
                        <td key={g.lo.id} className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleClick(g.lo.id, poId as PO_ID)}
                            disabled={pending}
                            className="min-w-[3.25rem] h-7 rounded-md text-xs font-mono font-medium transition-all hover:ring-2 hover:ring-primary/20 disabled:opacity-50 flex items-center justify-center mx-auto"
                            title={`${g.lo.code} → ${poDisplayId(poId)}: ${pct === 0 ? 'katkı yok' : `%${pct}`}`}
                          >
                            {pct === 0 ? (
                              <span className="text-muted-foreground/30 text-base leading-none select-none">—</span>
                            ) : (
                              <span
                                className={[
                                  'px-2 py-0.5 rounded-md tabular-nums',
                                  pct === 100
                                    ? 'bg-primary text-white'
                                    : pct === 75
                                    ? 'bg-primary/20 text-primary font-semibold'
                                    : pct === 50
                                    ? 'bg-primary/12 text-primary/80'
                                    : 'bg-primary/8 text-primary/60',
                                ].join(' ')}
                              >
                                {pct}%
                              </span>
                            )}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </TooltipProvider>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Single LO row ─────────────────────────────────────────────────────────────

function LORow({
  group,
  allItems,
  onSaved,
}: {
  group: LOGroup
  allItems: AssessmentItem[]
  onSaved: (loId: string, label: string, itemWeights: Record<string, number>, poWeights: Record<string, number>) => void
}) {
  const { lo, loItems } = group
  const [editing, setEditing] = useState(false)
  const [labelDraft, setLabelDraft] = useState(lo.label)
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({})
  const [poDrafts, setPoDrafts] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function startEdit() {
    setLabelDraft(lo.label)

    const idrafts: Record<string, string> = {}
    allItems.forEach(item => {
      const mapped = loItems.find(li => li.item.id === item.id)
      idrafts[item.id] = mapped ? String(mapped.weight) : '0'
    })
    setItemDrafts(idrafts)

    const pdrafts: Record<string, string> = {}
    ALL_POS.forEach(poId => {
      const contrib = (lo.poContributions ?? []).find(c => c.poId === poId)
      pdrafts[poId] = contrib ? String(contrib.weight) : '0'
    })
    setPoDrafts(pdrafts)

    setEditing(true)
  }

  function cancel() {
    setEditing(false)
  }

  function save() {
    startTransition(async () => {
      const promises: Promise<void>[] = []

      if (labelDraft.trim() !== lo.label) {
        promises.push(saveLOLabel(lo.id, labelDraft.trim()))
      }

      for (const [itemId, raw] of Object.entries(itemDrafts)) {
        const n = parseFloat(raw) || 0
        const prev = loItems.find(x => x.item.id === itemId)?.weight ?? 0
        if (n !== prev) promises.push(saveItemWeight(lo.id, itemId, n))
      }

      for (const [poId, raw] of Object.entries(poDrafts)) {
        const n = Math.min(1, Math.max(0, parseFloat(raw) || 0))
        const prev = (lo.poContributions ?? []).find(c => c.poId === poId)?.weight ?? 0
        if (n !== prev) promises.push(savePOContribution(lo.id, poId as PO_ID, n))
      }

      await Promise.all(promises)

      onSaved(
        lo.id,
        labelDraft.trim(),
        Object.fromEntries(Object.entries(itemDrafts).map(([k, v]) => [k, parseFloat(v) || 0])),
        Object.fromEntries(Object.entries(poDrafts).map(([k, v]) => [k, Math.min(1, Math.max(0, parseFloat(v) || 0))])),
      )
      setEditing(false)
    })
  }

  const itemsByGroup: Record<string, { label: string; items: AssessmentItem[] }> = {}
  for (const item of allItems) {
    if (!itemsByGroup[item.group]) itemsByGroup[item.group] = { label: item.groupLabel, items: [] }
    itemsByGroup[item.group].items.push(item)
  }

  return (
    <div
      className={`
        group relative rounded-xl border transition-all duration-150
        ${editing
          ? 'border-primary/40 bg-primary/[0.03] shadow-sm'
          : 'border-border bg-card hover:border-border/80 hover:shadow-sm'
        }
      `}
    >
      <div className="p-4">
        {/* Header: badge + label + buttons */}
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex-shrink-0 inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {lo.code}
          </span>

          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                autoFocus
                value={labelDraft}
                onChange={e => setLabelDraft(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && cancel()}
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            ) : (
              <p className="text-sm font-medium text-ink leading-snug">{lo.label}</p>
            )}
          </div>

          {!editing ? (
            <button
              onClick={startEdit}
              className="flex-shrink-0 mt-0.5 p-1 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-primary transition-all"
              title="Düzenle"
            >
              <Pencil size={14} />
            </button>
          ) : (
            <div className="flex-shrink-0 flex items-center gap-1 mt-0.5">
              <button
                onClick={save}
                disabled={pending}
                className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-40"
                title="Kaydet"
              >
                <Check size={15} />
              </button>
              <button
                onClick={cancel}
                disabled={pending}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors disabled:opacity-40"
                title="İptal"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* View mode: only show assessment item weights */}
        {!editing && (
          <div className="mt-3 ml-[3.25rem] flex flex-wrap items-center gap-2">
            {loItems.length > 0 ? loItems.map(({ item, weight }) => (
              <div
                key={item.id}
                className="inline-flex items-stretch rounded-lg border border-border overflow-hidden text-xs"
              >
                <span className="px-2 py-1 bg-muted font-medium text-ink">{item.code}</span>
                <span className="w-px bg-border" />
                <span className="px-2 py-1 bg-background font-mono text-muted-foreground tabular-nums">
                  {weight}%
                </span>
              </div>
            )) : (
              <span className="text-xs text-muted-foreground italic">
                Ölçüm kalemi eşlenmemiş — düzenlemek için kalem ikonuna tıklayın
              </span>
            )}
          </div>
        )}

        {/* Edit mode: assessment items + PO contributions */}
        {editing && (
          <div className="mt-4 ml-[3.25rem] space-y-4">
            {allItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Henüz ölçüm kalemi yok. Önce "Ölçüm Kalemleri" bölümünden kalem ekleyin.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  Ölçüm Kalemleri — 0: eşlenmiyor · yüksek değer = bu ÖÇ'e daha fazla katkı
                </p>
                {Object.entries(itemsByGroup).map(([groupCode, g]) => (
                  <div key={groupCode} className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">{g.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.sort((a, b) => a.order - b.order).map(item => (
                        <div
                          key={item.id}
                          className="inline-flex items-stretch rounded-lg border border-border overflow-hidden text-xs"
                        >
                          <span className="px-2 py-1 bg-muted font-medium text-ink">{item.code}</span>
                          <span className="w-px bg-border" />
                          <div className="flex items-center gap-1 px-2 py-1 bg-background">
                            <span className="text-[10px] text-muted-foreground">ağr.</span>
                            <input
                              type="number"
                              min={0}
                              step={0.25}
                              value={itemDrafts[item.id] ?? '0'}
                              onChange={e => setItemDrafts(d => ({ ...d, [item.id]: e.target.value }))}
                              className="w-12 bg-transparent text-center text-xs font-mono text-ink outline-none border-b border-primary/50 focus:border-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Program Çıktısı Katkıları — 0%: yok · 25%: düşük · 50%: orta · 75%: yüksek · 100%: tam
              </p>
              <div className="flex flex-wrap gap-1.5">
                <TooltipProvider>
                  {ALL_POS.map(poId => (
                    <div
                      key={poId}
                      className="inline-flex items-stretch rounded-lg border border-primary/20 overflow-hidden text-xs bg-primary/[0.04]"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="px-2 py-1 font-medium text-primary cursor-default">
                            {poDisplayId(poId)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold mb-0.5">{PO_LABELS[poId]}</p>
                          <p>{PO_DESCRIPTIONS[poId]}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="w-px bg-primary/15" />
                      <div className="flex items-stretch">
                        {[0, 0.25, 0.5, 0.75, 1].map((val, i) => {
                          const current = parseFloat(poDrafts[poId] ?? '0') || 0
                          const active = current === val
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setPoDrafts(d => ({ ...d, [poId]: String(val) }))}
                              className={[
                                'px-1.5 py-1 text-[10px] font-mono transition-colors',
                                i > 0 ? 'border-l border-primary/15' : '',
                                active
                                  ? 'bg-primary text-white'
                                  : 'text-primary/60 hover:bg-primary/10',
                              ].join(' ')}
                            >
                              {`${val * 100}%`}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add LO inline form ────────────────────────────────────────────────────────

function AddLOForm({ courseId, onAdded }: { courseId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await addLODefinition(courseId, { code, label })
      setCode('')
      setLabel('')
      setOpen(false)
      onAdded()
    })
  }

  function close() {
    setCode('')
    setLabel('')
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        Yeni ÖÇ
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) close() }}
        >
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-ink">Yeni Öğrenme Çıktısı</h2>
              <button onClick={close} className="text-muted-foreground hover:text-ink transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="lo-code">Kod</Label>
                <Input
                  id="lo-code"
                  autoFocus
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="ÖÇ-1"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lo-label">Açıklama</Label>
                <Input
                  id="lo-label"
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="Öğrenme çıktısını tanımlayın…"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={close}>
                  İptal
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? 'Kaydediliyor…' : 'Ekle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function LOMapClient({
  loGroups,
  allItems,
  courseId,
}: {
  loGroups: LOGroup[]
  allItems: AssessmentItem[]
  courseId: string
}) {
  const [groups, setGroups] = useState<LOGroup[]>(loGroups)
  const router = useRouter()

  const loGroupKey = loGroups.map(g => g.lo.id).join(',')
  const prevKeyRef = useRef(loGroupKey)
  if (prevKeyRef.current !== loGroupKey) {
    prevKeyRef.current = loGroupKey
    setGroups(loGroups)
  }

  function handleSaved(
    loId: string,
    label: string,
    itemWeights: Record<string, number>,
    poWeights: Record<string, number>,
  ) {
    setGroups(gs => gs.map(g => {
      if (g.lo.id !== loId) return g
      return {
        lo: {
          ...g.lo,
          label,
          itemWeights: Object.entries(itemWeights)
            .filter(([, w]) => w > 0)
            .map(([itemId, weight]) => ({ itemId, weight })),
          poContributions: Object.entries(poWeights)
            .filter(([, w]) => w > 0)
            .map(([poId, weight]) => ({ poId: poId as PO_ID, weight })),
        },
        loItems: allItems
          .filter(item => (itemWeights[item.id] ?? 0) > 0)
          .map(item => ({ item, weight: itemWeights[item.id] })),
      }
    }))
  }

  function handlePOCellChange(loId: string, poId: PO_ID, weight: number) {
    setGroups(gs => gs.map(g => {
      if (g.lo.id !== loId) return g
      const existing = (g.lo.poContributions ?? []).filter(c => c.poId !== poId)
      return {
        ...g,
        lo: {
          ...g.lo,
          poContributions: weight > 0 ? [...existing, { poId, weight }] : existing,
        },
      }
    }))
  }

  return (
    <div className="space-y-4">
      <LOPOMatrix groups={groups} onCellChange={handlePOCellChange} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Öğrenme Çıktısı — Ölçüm Kalemi Eşlemesi</CardTitle>
          <AddLOForm courseId={courseId} onAdded={() => router.refresh()} />
        </CardHeader>
        <CardContent className="space-y-2">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Henüz öğrenme çıktısı yok. "Yeni ÖÇ" ile başlayın.
            </p>
          ) : (
            groups.map(g => (
              <LORow key={g.lo.id} group={g} allItems={allItems} onSaved={handleSaved} />
            ))
          )}
          {groups.length > 0 && (
            <p className="text-xs text-muted-foreground pt-1">
              Bir satırın üzerine gelin ve düzenlemek için kalem ikonuna tıklayın.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
