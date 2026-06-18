import { getStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileArchive, Download, FileText } from 'lucide-react'
import BBODownloadButton from './BBODownloadButton'

export default function BBOPage() {
  const store = getStore()

  const stats = {
    courses: store.courses.length,
    students: store.students.length,
    items: store.assessmentItems.length,
    scores: store.scores.filter(s => s.raw !== null).length,
    evidence: store.evidenceFiles.length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">BBO Dosyası İndir</h1>
        <p className="text-muted-foreground mt-1">
          MÜDEK akreditasyon portalı için hazır ZIP paketi oluşturun.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {Object.entries({
          'Ders': stats.courses,
          'Öğrenci': stats.students,
          'Ölçüm Kalemi': stats.items,
          'Not Kaydı': stats.scores,
          'Kanıt Dosyası': stats.evidence,
        }).map(([label, val]) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-ink">{val}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ZIP contents preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            ZIP İçeriği
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="overflow-x-auto">
          <div className="font-mono text-xs text-muted-foreground space-y-1.5 bg-muted/30 p-4 rounded-md min-w-max">
            <p className="text-ink font-medium">mudek-bbo.zip</p>
            <p className="pl-4">├── EK-2_Program_CO_Matrix.xlsx</p>
            <p className="pl-4">├── EK-2_Student_CO_Table.xlsx</p>
            {store.courses.map(c => (
              <p key={c.id} className="pl-4">├── {c.code}_LO_Scores.xlsx</p>
            ))}
            {store.evidenceFiles.length > 0 ? (
              <>
                <p className="pl-4">└── evidence/</p>
                {store.evidenceFiles.map(f => (
                  <p key={f.id} className="pl-8">└── {f.storedName}</p>
                ))}
              </>
            ) : (
              <p className="pl-4">└── evidence/ <span className="text-muted-foreground">(boş)</span></p>
            )}
          </div>
          </div>

          <div className="pt-2">
            <BBODownloadButton />
          </div>

          <p className="text-xs text-muted-foreground">
            ZIP dosyası ASCII dosya adları içerir (Türkçe karakter yok). MÜDEK portalı ile uyumludur.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
