import { getStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Calendar, User } from 'lucide-react'
import EvidenceUploadClient from './EvidenceUploadClient'

export default function EvidencePage() {
  const store = getStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Kanıt Dosyaları</h1>
        <p className="text-muted-foreground mt-1">
          MÜDEK akreditasyon kanıtlarını yükleyin. Dosyalar BBO ZIP'ine dahil edilir.
        </p>
      </div>

      <EvidenceUploadClient
        courses={store.courses.map(c => ({ id: c.id, code: c.code, name: c.name }))}
        items={store.assessmentItems.map(i => ({
          id: i.id,
          courseId: i.courseId,
          code: i.code,
          label: i.label,
          groupLabel: i.groupLabel,
          order: i.order,
        }))}
      />

      {/* Uploaded files */}
      {store.evidenceFiles.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Yüklenen Dosyalar ({store.evidenceFiles.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Dosya Adı</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Ders</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Kategori</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Bağlı Sorular</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Boyut</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Yükleyen</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {store.evidenceFiles.map(f => {
                  const course = store.courses.find(c => c.id === f.courseId)
                  return (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-ink">{f.storedName}</p>
                            <p className="text-xs text-muted-foreground">{f.originalName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline">{course?.code ?? f.courseId}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{f.category}</td>
                      <td className="px-4 py-2.5">
                        {f.itemIds && f.itemIds.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {f.itemIds.map(itemId => {
                              const item = store.assessmentItems.find(i => i.id === itemId)
                              return (
                                <Badge key={itemId} variant="secondary" className="text-[10px]">
                                  {item?.code ?? itemId}
                                </Badge>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {(f.sizeBytes / 1024).toFixed(0)} KB
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        {f.uploadedBy ? (
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {f.uploadedBy}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(f.uploadedAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz kanıt dosyası yüklenmedi.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
