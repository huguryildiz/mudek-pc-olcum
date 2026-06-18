'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addCourse } from './actions'

export function NewCourseModal() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const instructorsRaw = (fd.get('instructors') as string) ?? ''
    const instructors = instructorsRaw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    setPending(true)
    await addCourse({
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      semester: fd.get('semester') as string,
      instructors,
    })
    setPending(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4" />
        Yeni Ders Ekle
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-ink">Yeni Ders Ekle</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Ders Kodu</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="EE311"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">Ders Adı</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Sinyaller ve Sistemler"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester">Dönem</Label>
                <Input
                  id="semester"
                  name="semester"
                  placeholder="2025 Bahar"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructors">Öğretim Üyeleri</Label>
                <Input
                  id="instructors"
                  name="instructors"
                  placeholder="H. Uğur Yıldız, Aykut Yıldız"
                />
                <p className="text-xs text-muted-foreground">Virgülle ayırın</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
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
