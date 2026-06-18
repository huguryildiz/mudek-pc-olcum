'use client'

import { useState, useRef, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, FileText, CheckCircle2, AlertCircle, Link2 } from 'lucide-react'

interface Course { id: string; code: string; name: string }
interface Item { id: string; courseId: string; code: string; label: string; groupLabel: string; order: number }

const CATEGORIES = [
  'PÇ Kanıtları',
  'Ders Notları',
  'Ödev / Proje',
  'Sınav Soruları',
  'Değerlendirme Rubriği',
  'Diğer',
]

export default function EvidenceUploadClient({ courses, items }: { courses: Course[]; items: Item[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [file, setFile] = useState<File | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Seçili dersin soruları, groupLabel altında gruplanmış
  const groupedItems = useMemo(() => {
    const courseItems = items
      .filter(i => i.courseId === courseId)
      .sort((a, b) => a.groupLabel.localeCompare(b.groupLabel, 'tr') || a.order - b.order)
    const groups = new Map<string, Item[]>()
    for (const it of courseItems) {
      const arr = groups.get(it.groupLabel) ?? []
      arr.push(it)
      groups.set(it.groupLabel, arr)
    }
    return [...groups.entries()]
  }, [items, courseId])

  function changeCourse(id: string) {
    setCourseId(id)
    setSelectedItemIds(new Set()) // ders değişince soru seçimini sıfırla
  }

  function toggleItem(id: string) {
    setSelectedItemIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !courseId) return

    setStatus('uploading')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('courseId', courseId)
    fd.append('category', category)
    fd.append('itemIds', JSON.stringify([...selectedItemIds]))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Yükleme hatası')
      setStatus('success')
      setMessage(`Kaydedildi: ${json.storedName}`)
      setFile(null)
      setSelectedItemIds(new Set())
      if (fileRef.current) fileRef.current.value = ''
      // Refresh page data
      setTimeout(() => window.location.reload(), 1500)
    } catch (err: unknown) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Hata')
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="courseId">Ders</Label>
              <select
                id="courseId"
                value={courseId}
                onChange={e => changeCourse(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="file">Dosya</Label>
              <input
                ref={fileRef}
                id="file"
                type="file"
                accept=".pdf,.xlsx,.docx,.png,.jpg"
                onChange={e => { setFile(e.target.files?.[0] ?? null); setStatus('idle') }}
                className="flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md text-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-ink">{file.name}</span>
              <span className="text-muted-foreground ml-auto">{(file.size / 1024).toFixed(0)} KB</span>
            </div>
          )}

          {/* Soru bağlama (opsiyonel) — bağlanan sorular dosyayı ilgili PÇ'lere taşır */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <Label className="mb-0">Kanıtladığı Sorular <span className="font-normal text-muted-foreground">(opsiyonel)</span></Label>
              {selectedItemIds.size > 0 && (
                <span className="text-xs text-primary">{selectedItemIds.size} seçili</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Seçilen sorular, dosyayı Soru → ÖÇ → PÇ zinciri üzerinden ilgili Program Çıktılarında görünür kılar.
            </p>
            {groupedItems.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 italic">Bu derse tanımlı soru yok.</p>
            ) : (
              <div className="rounded-md border border-border divide-y divide-border max-h-56 overflow-y-auto">
                {groupedItems.map(([groupLabel, groupItems]) => (
                  <div key={groupLabel} className="p-2.5">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">{groupLabel}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {groupItems.map(it => {
                        const active = selectedItemIds.has(it.id)
                        return (
                          <button
                            type="button"
                            key={it.id}
                            onClick={() => toggleItem(it.id)}
                            title={it.label}
                            className={
                              'rounded-md border px-2 py-1 text-xs transition-colors ' +
                              (active
                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                : 'border-border text-ink hover:bg-muted')
                            }
                          >
                            {it.code}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={!file || status === 'uploading'}>
              {status === 'uploading' ? (
                <>Yükleniyor…</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />Yükle</>
              )}
            </Button>
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-attainment-above">
                <CheckCircle2 className="w-4 h-4" />
                {message}
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-attainment-below">
                <AlertCircle className="w-4 h-4" />
                {message}
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
