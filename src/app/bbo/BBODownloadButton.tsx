'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

export default function BBODownloadButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch('/api/bbo')
      if (!res.ok) throw new Error('ZIP oluşturma hatası')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mudek-bbo.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('ZIP indirme hatası: ' + (e instanceof Error ? e.message : 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={loading} size="lg">
      {loading ? (
        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />ZIP Hazırlanıyor…</>
      ) : (
        <><Download className="w-4 h-4 mr-2" />BBO ZIP İndir</>
      )}
    </Button>
  )
}
