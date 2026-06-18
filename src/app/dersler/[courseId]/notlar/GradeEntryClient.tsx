'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { saveScore, importScores, type ImportRow } from './actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  CheckCircle2, Loader2, AlertCircle, Upload,
  FileSpreadsheet, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import type { AssessmentItem } from '@/lib/types'

interface GroupDef {
  group: string
  groupLabel: string
  items: AssessmentItem[]
}

interface StudentDef {
  id: string
  name: string
  studentNo: string
  enrollmentId: string
}

interface Props {
  courseId: string
  groups: GroupDef[]
  students: StudentDef[]
  itemToLOs: Record<string, string[]>
  itemWeights: Record<string, number>
  initialScores: Record<string, Record<string, number | null>>
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

// ── Manual entry table ────────────────────────────────────

function ManualEntryTab({
  courseId, groups, students, itemToLOs, itemWeights, initialScores
}: Props) {
  const [scores, setScores] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {}
    for (const [enrollmentId, itemScores] of Object.entries(initialScores)) {
      init[enrollmentId] = {}
      for (const [itemId, raw] of Object.entries(itemScores)) {
        init[enrollmentId][itemId] = raw === null ? '' : String(raw)
      }
    }
    return init
  })

  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({})
  const [, startTransition] = useTransition()

  function makeKey(enrollmentId: string, itemId: string) {
    return `${enrollmentId}__${itemId}`
  }

  function getSaveState(enrollmentId: string, itemId: string): SaveState {
    return saveStates[makeKey(enrollmentId, itemId)] || 'idle'
  }

  function handleChange(enrollmentId: string, itemId: string, value: string) {
    setScores(prev => ({
      ...prev,
      [enrollmentId]: { ...(prev[enrollmentId] || {}), [itemId]: value }
    }))
  }

  function handleBlur(enrollmentId: string, itemId: string, item: AssessmentItem) {
    const rawStr = (scores[enrollmentId]?.[itemId] ?? '').trim()
    const key = makeKey(enrollmentId, itemId)

    let raw: number | null = null
    if (rawStr !== '') {
      const parsed = parseFloat(rawStr)
      if (isNaN(parsed) || parsed < 0 || parsed > item.maxRaw) {
        setSaveStates(prev => ({ ...prev, [key]: 'error' }))
        return
      }
      raw = parsed
    }

    setSaveStates(prev => ({ ...prev, [key]: 'saving' }))
    startTransition(async () => {
      try {
        await saveScore(enrollmentId, itemId, raw)
        setSaveStates(prev => ({ ...prev, [key]: 'saved' }))
        setTimeout(() => {
          setSaveStates(prev => {
            if (prev[key] === 'saved') return { ...prev, [key]: 'idle' }
            return prev
          })
        }, 2000)
      } catch {
        setSaveStates(prev => ({ ...prev, [key]: 'error' }))
      }
    })
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <FileSpreadsheet className="w-10 h-10 mb-3 opacity-30" />
        <p className="font-medium">Bu ders için henüz ölçüm kalemi tanımlanmamış.</p>
        <p className="text-sm mt-1">Ders detay sayfasında ÖÇ eşlemesi yapıldıktan sonra notlar buraya girilebilir.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(({ group, groupLabel, items }) => (
        <Card key={group}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {groupLabel}
              <Badge variant="outline" className="font-mono text-xs">{group}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left font-medium text-ink w-40">Öğrenci</th>
                    <th className="px-3 py-2.5 text-left font-medium text-ink w-32 text-xs">Öğrenci No</th>
                    {items.map(item => (
                      <th key={item.id} className="px-2 py-2.5 text-center font-medium text-ink min-w-[120px]">
                        <div className="font-semibold font-mono text-sm">{item.code}</div>
                        <div className="mt-0.5 inline-block text-[10px] font-mono px-1.5 py-0 rounded-full bg-muted text-muted-foreground border border-border">{item.maxRaw}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={items.length + 2} className="px-4 py-8 text-center text-muted-foreground text-sm">
                        Henüz kayıtlı öğrenci yok. Excel içe aktarma ile öğrencileri ekleyebilirsiniz.
                      </td>
                    </tr>
                  ) : students.map(student => (
                    <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium text-ink whitespace-nowrap">{student.name}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{student.studentNo}</td>
                      {items.map(item => {
                        const state = getSaveState(student.enrollmentId, item.id)
                        return (
                          <td key={item.id} className="px-2 py-1.5 text-center">
                            <div className="flex items-center gap-1 justify-center">
                              <Input
                                type="number"
                                min={0}
                                max={item.maxRaw}
                                step="0.5"
                                className="w-20 text-center h-8 text-sm"
                                value={scores[student.enrollmentId]?.[item.id] ?? ''}
                                placeholder="–"
                                onChange={e => handleChange(student.enrollmentId, item.id, e.target.value)}
                                onBlur={() => handleBlur(student.enrollmentId, item.id, item)}
                              />
                              <div className="w-4 flex-shrink-0">
                                {state === 'saving' && <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
                                {state === 'saved' && <CheckCircle2 className="w-3.5 h-3.5 text-attainment-above" />}
                                {state === 'error' && <AlertCircle className="w-3.5 h-3.5 text-attainment-below" />}
                              </div>
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground text-center">
        Notlar otomatik kaydedilir. Boş bırakmak = ölçülmedi (sıfırdan farklı, hesaplamalarda hariç tutulur).
      </p>
    </div>
  )
}

// ── Excel import types ────────────────────────────────────

interface ParsedRow {
  rowIndex: number
  studentNo: string
  name: string
  scores: { itemCode: string; raw: number | null }[]
  warnings: string[]
}

interface ParseResult {
  fileName: string
  totalRows: number
  matchedItems: AssessmentItem[]
  unmatchedColumns: string[]
  skippedRows: number
  rows: ParsedRow[]
}

// ── Excel import panel ────────────────────────────────────

function ExcelImportTab({
  courseId,
  allItems,
}: {
  courseId: string
  allItems: AssessmentItem[]
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState<{ imported: number; studentsCreated: number; studentsUpdated: number } | null>(null)
  const [showFormat, setShowFormat] = useState(false)

  const itemCodes = allItems.map(i => i.code)

  async function handleFile(file: File) {
    setParseResult(null)
    setParseError(null)
    setImportDone(null)

    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' }) as unknown[][]

      if (raw.length < 2) {
        setParseError('Dosya boş veya yalnızca başlık satırı içeriyor.')
        return
      }

      // Parse header row
      const headers = (raw[0] as unknown[]).map(h => String(h ?? '').trim())

      // Find student number column
      const studentNoIdx = headers.findIndex(h =>
        /öğrenci.?no|ogrenci.?no|student.?no|no\.?$/i.test(h) || h.toUpperCase() === 'NO'
      )
      if (studentNoIdx === -1) {
        setParseError(
          `"Öğrenci No" sütunu bulunamadı. Başlık satırında "Öğrenci No" veya benzeri bir sütun olmalı.\n\n` +
          `Okunan başlıklar: ${headers.join(', ')}`
        )
        return
      }

      // Find name column (optional)
      const nameIdx = headers.findIndex(h =>
        /ad.?soyad|adsoyad|isim|name/i.test(h)
      )

      // Match item codes to columns
      const itemCodeUpper = new Map(allItems.map(i => [i.code.toUpperCase(), i]))
      const columnMap: { colIdx: number; item: AssessmentItem }[] = []
      const unmatchedColumns: string[] = []

      headers.forEach((h, idx) => {
        if (idx === studentNoIdx || idx === nameIdx) return
        if (!h) return
        const item = itemCodeUpper.get(h.toUpperCase())
        if (item) {
          columnMap.push({ colIdx: idx, item })
        } else {
          // Skip common non-score columns silently
          if (/öğrenci.?no|ad.?soyad|adsoyad|isim|name|no\.?$/i.test(h)) return
          unmatchedColumns.push(h)
        }
      })

      const matchedItems = columnMap.map(c => c.item)

      // Parse data rows
      const parsedRows: ParsedRow[] = []
      let skippedRows = 0

      for (let r = 1; r < raw.length; r++) {
        const row = raw[r] as unknown[]
        const studentNo = String(row[studentNoIdx] ?? '').trim()
        if (!studentNo) { skippedRows++; continue }

        const name = nameIdx >= 0 ? String(row[nameIdx] ?? '').trim() : ''
        const warnings: string[] = []

        if (!/^\d{11}$/.test(studentNo)) {
          warnings.push(`Öğrenci no "${studentNo}" 11 haneli rakam olmalıdır — bu satır aktarılmayacak`)
        }

        const scores = columnMap.map(({ colIdx, item }) => {
          const cell = row[colIdx]
          const raw = cell === '' || cell === null || cell === undefined
            ? null
            : (() => {
                const n = Number(cell)
                if (isNaN(n)) {
                  warnings.push(`${item.code}: geçersiz değer "${cell}"`)
                  return null
                }
                if (n < 0 || n > item.maxRaw) {
                  warnings.push(`${item.code}: ${n} aralık dışı (0–${item.maxRaw})`)
                }
                return n
              })()
          return { itemCode: item.code, raw }
        })

        parsedRows.push({ rowIndex: r + 1, studentNo, name, scores, warnings })
      }

      setParseResult({
        fileName: file.name,
        totalRows: parsedRows.length,
        matchedItems,
        unmatchedColumns,
        skippedRows,
        rows: parsedRows,
      })
    } catch (e) {
      setParseError(`Dosya okunamadı: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  async function handleImport() {
    if (!parseResult) return
    setImporting(true)
    try {
      const importRows: ImportRow[] = parseResult.rows.map(r => ({
        studentNo: r.studentNo,
        name: r.name,
        scores: r.scores,
      }))
      const result = await importScores(courseId, importRows)
      setImportDone(result)
      setParseResult(null)
      router.refresh()
    } catch (e) {
      setParseError(`İçe aktarma hatası: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* Format guide */}
      <Card>
        <CardHeader className="pb-2">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setShowFormat(v => !v)}
          >
            <CardTitle className="text-sm flex items-center gap-2 font-medium">
              <Info className="w-4 h-4 text-primary" />
              Beklenen Excel Formatı
            </CardTitle>
            {showFormat
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>
        </CardHeader>
        {showFormat && (
          <CardContent className="pt-0 space-y-3 text-sm">
            <p className="text-muted-foreground">
              İlk satır <strong>başlık satırı</strong> olmalıdır. Gerekli ve isteğe bağlı sütunlar:
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs border border-border rounded w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-1.5 text-left border-r border-border font-semibold text-primary">Öğrenci No</th>
                    <th className="px-3 py-1.5 text-left border-r border-border text-muted-foreground font-normal italic">Ad Soyad (isteğe bağlı)</th>
                    {itemCodes.slice(0, 5).map(code => (
                      <th key={code} className="px-3 py-1.5 text-center border-r border-border font-semibold">{code}</th>
                    ))}
                    {itemCodes.length > 5 && (
                      <th className="px-3 py-1.5 text-center text-muted-foreground">…</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-1.5 border-r border-border font-mono">22120110001</td>
                    <td className="px-3 py-1.5 border-r border-border text-muted-foreground">Elif Yılmaz</td>
                    {itemCodes.slice(0, 5).map((code, i) => (
                      <td key={code} className="px-3 py-1.5 text-center border-r border-border">
                        {[85, 90, 70, 78, 95][i] ?? '—'}
                      </td>
                    ))}
                    {itemCodes.length > 5 && <td className="px-3 py-1.5 text-center text-muted-foreground">…</td>}
                  </tr>
                </tbody>
              </table>
            </div>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside text-xs">
              <li><strong>"Öğrenci No"</strong> sütunu zorunludur; eşleşme bu alana göre yapılır</li>
              <li>Sütun adları ölçüm kalemi kodlarıyla tam eşleşmeli (büyük/küçük harf fark etmez)</li>
              <li>Tanımlı kodlar: {itemCodes.length > 0 ? itemCodes.join(', ') : '—'}</li>
              <li>Boş hücre = ölçülmedi (sıfır sayılmaz, hesaplamalarda hariç tutulur)</li>
              <li>Öğrenci yoksa otomatik oluşturulur; varsa puan güncellenir</li>
            </ul>
          </CardContent>
        )}
      </Card>

      {/* Upload zone */}
      {!parseResult && !importDone && (
        <Card
          className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-ink">Excel dosyasını seçin veya buraya sürükleyin</p>
              <p className="text-sm text-muted-foreground mt-0.5">.xlsx veya .xls formatı desteklenir</p>
            </div>
            <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); fileRef.current?.click() }}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Dosya Seç
            </Button>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {/* Parse error */}
      {parseError && (
        <Card className="border-attainment-below/30 bg-attainment-below/5">
          <CardContent className="flex gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-attainment-below flex-shrink-0 mt-0.5" />
            <pre className="text-sm text-attainment-below whitespace-pre-wrap font-sans">{parseError}</pre>
          </CardContent>
        </Card>
      )}

      {/* Import success */}
      {importDone && (
        <Card className="border-attainment-above/30 bg-attainment-above/5">
          <CardContent className="flex items-start gap-3 py-4">
            <CheckCircle2 className="w-5 h-5 text-attainment-above flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-ink">İçe aktarma tamamlandı</p>
              <p className="text-muted-foreground mt-0.5">
                {importDone.imported} puan kaydedildi · {importDone.studentsCreated} yeni öğrenci oluşturuldu · {importDone.studentsUpdated} güncellendi
              </p>
              <button
                className="text-primary text-xs mt-2 underline underline-offset-2"
                onClick={() => { setImportDone(null); setParseError(null) }}
              >
                Yeni dosya yükle
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parse result preview */}
      {parseResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 bg-attainment-above/10 text-attainment-above px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span><strong>{parseResult.totalRows}</strong> öğrenci satırı okundu</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span><strong>{parseResult.matchedItems.length}</strong> sütun eşleşti</span>
            </div>
            {parseResult.skippedRows > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                <span><strong>{parseResult.skippedRows}</strong> satır atlandı (öğrenci no boş)</span>
              </div>
            )}
            {parseResult.unmatchedColumns.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Eşleşmeyen: {parseResult.unmatchedColumns.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Matched items */}
          {parseResult.matchedItems.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Aktarılacak ölçüm kalemleri: </span>
              {parseResult.matchedItems.map(i => (
                <span key={i.id} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                  {i.code}
                </span>
              ))}
            </div>
          )}

          {/* Warning: no matched items */}
          {parseResult.matchedItems.length === 0 && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="flex gap-2 py-3 text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Hiçbir ölçüm kalemi sütunu eşleşmedi. Sütun adlarının ders tanımındaki kodlarla aynı olduğunu kontrol edin.
                  {allItems.length > 0 && ` Beklenen kodlar: ${allItems.map(i => i.code).join(', ')}`}
                </span>
              </CardContent>
            </Card>
          )}

          {/* Preview table — first 10 rows */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Önizleme (ilk {Math.min(parseResult.rows.length, 10)} satır)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium">Öğrenci No</th>
                      <th className="px-3 py-2 text-left font-medium">Ad Soyad</th>
                      {parseResult.matchedItems.map(item => (
                        <th key={item.id} className="px-2 py-2 text-center font-medium font-mono">{item.code}</th>
                      ))}
                      <th className="px-3 py-2 text-left font-medium text-amber-600">Uyarılar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseResult.rows.slice(0, 10).map(row => (
                      <tr key={row.rowIndex} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-1.5 font-mono">{row.studentNo}</td>
                        <td className="px-3 py-1.5">{row.name || <span className="text-muted-foreground">—</span>}</td>
                        {row.scores.map((s, i) => (
                          <td key={i} className="px-2 py-1.5 text-center">
                            {s.raw === null ? <span className="text-muted-foreground">—</span> : s.raw}
                          </td>
                        ))}
                        <td className="px-3 py-1.5 text-amber-600">
                          {row.warnings.length > 0 ? row.warnings.join('; ') : ''}
                        </td>
                      </tr>
                    ))}
                    {parseResult.rows.length > 10 && (
                      <tr>
                        <td colSpan={parseResult.matchedItems.length + 3} className="px-3 py-2 text-center text-muted-foreground">
                          … ve {parseResult.rows.length - 10} satır daha
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={importing || parseResult.matchedItems.length === 0}
            >
              {importing
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> İçe Aktarılıyor…</>
                : <><CheckCircle2 className="w-4 h-4 mr-2" /> {parseResult.totalRows} Öğrenciyi İçe Aktar</>
              }
            </Button>
            <Button
              variant="outline"
              onClick={() => { setParseResult(null); setParseError(null) }}
            >
              İptal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────

export default function GradeEntryClient({
  courseId, groups, students, itemToLOs, itemWeights, initialScores
}: Props) {
  const allItems = groups.flatMap(g => g.items)

  return (
    <Tabs defaultValue="manuel">
      <TabsList className="mb-4">
        <TabsTrigger value="manuel">Manuel Giriş</TabsTrigger>
        <TabsTrigger value="excel">Excel İçe Aktar</TabsTrigger>
      </TabsList>

      <TabsContent value="manuel">
        <ManualEntryTab
          courseId={courseId}
          groups={groups}
          students={students}
          itemToLOs={itemToLOs}
          itemWeights={itemWeights}
          initialScores={initialScores}
        />
      </TabsContent>

      <TabsContent value="excel">
        <ExcelImportTab courseId={courseId} allItems={allItems} />
      </TabsContent>
    </Tabs>
  )
}
