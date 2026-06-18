'use client'

import { Paperclip, FileText, Download, FolderOpen } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { POEvidenceTree } from '@/lib/types'

interface Props {
  poDisplay: string        // örn. "PÇ-1"
  poLabel: string          // örn. "Mühendislik Bilgisi"
  poDescription: string
  tree: POEvidenceTree
  variant?: 'row' | 'header'
}

function fileHref(id: string) {
  return `/api/evidence/${id}`
}

export default function POEvidenceTrigger({
  poDisplay,
  poLabel,
  poDescription,
  tree,
  variant = 'row',
}: Props) {
  const count = tree.totalFiles

  const trigger =
    variant === 'header' ? (
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
        title={`${poLabel} — kanıtları gör`}
      >
        <span>{poDisplay}</span>
        {count > 0 && <Paperclip className="w-3 h-3 text-primary" />}
      </button>
    ) : (
      <button
        type="button"
        className="group inline-flex items-center gap-2 text-left hover:text-primary transition-colors"
        title="Kanıt dosyalarını gör"
      >
        <span>
          <span className="font-medium text-ink group-hover:text-primary">{poDisplay}</span>
          <span className="ml-2 text-xs text-muted-foreground">{poLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
          <Paperclip className="w-3.5 h-3.5" />
          {count}
        </span>
      </button>
    )

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {poDisplay} · {poLabel}
          </SheetTitle>
          <SheetDescription>{poDescription}</SheetDescription>
          <p className="mt-2 text-xs text-muted-foreground">
            {count > 0
              ? `${count} kanıt dosyası · Soru → ÖÇ → PÇ zincirinden türetildi`
              : 'Bu program çıktısı için henüz kanıt dosyası bağlanmadı.'}
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {tree.courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Kanıt yok. Kanıtlar sayfasından bir dosya yükleyip ilgili soruları bağlayın.
              </p>
            </div>
          ) : (
            tree.courses.map(course => (
              <div key={course.courseId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{course.courseCode}</Badge>
                  <span className="text-sm font-medium text-ink">{course.courseName}</span>
                </div>

                <div className="space-y-3 border-l-2 border-border pl-4">
                  {course.los.map(lo => (
                    <div key={lo.loId} className="space-y-2">
                      <p className="text-sm font-medium text-ink">
                        {lo.loCode}
                        <span className="ml-2 font-normal text-muted-foreground">{lo.loLabel}</span>
                      </p>
                      {lo.items.map(item => (
                        <div key={item.itemId} className="ml-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            {item.itemCode} · {item.itemLabel}
                          </p>
                          <ul className="space-y-1">
                            {item.files.map(f => (
                              <li key={f.id}>
                                <a
                                  href={fileHref(f.id)}
                                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted transition-colors"
                                >
                                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span className="flex-1 min-w-0">
                                    <span className="block truncate text-ink">{f.originalName}</span>
                                    <span className="block text-xs text-muted-foreground">
                                      {f.category} · {(f.sizeBytes / 1024).toFixed(0)} KB
                                    </span>
                                  </span>
                                  <Download className="w-4 h-4 text-muted-foreground shrink-0" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
