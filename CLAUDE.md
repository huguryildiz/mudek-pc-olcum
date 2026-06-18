# CLAUDE.md — MÜDEK Program Çıktıları Ölçüm Sistemi

## Proje Özeti

Next.js 15 tabanlı mühendislik program çıktısı (PÇ) ölçüm ve raporlama uygulaması. Türkiye'nin mühendislik akreditasyon kurulu MÜDEK (ABET muadili) gerekliliklerine uygun BBO dosyası üretir. Şu an MVP/Phase 0: veritabanı yok, tüm durum bellek içi tekil nesne + JSON dosyasında tutulur.

## Komutlar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run test     # Vitest — 15 golden test
```

Ortam değişkeni, Docker veya veritabanı gerekmez. `data/store.json` yoksa uygulama otomatik seed uygular.

## Mimari

### Teknoloji Yığını

- **Framework:** Next.js 15.3.3 App Router, React 19, TypeScript 5 (strict)
- **Stil:** Tailwind CSS 3.4, shadcn/ui deseni (Radix UI primitives), lucide-react
- **Hesap tablosu:** xlsx (sunucu tarafı)
- **ZIP:** jszip
- **Test:** Vitest 3.1.4, node ortamı, globals: true
- **Yardımcılar:** clsx + tailwind-merge → `cn()`, `@/*` → `./src/*` path alias

### Dizin Yapısı

```
src/
├── app/
│   ├── layout.tsx                  # Kök layout: Sidebar + main
│   ├── page.tsx                    # Dashboard — program PÇ matriksi
│   ├── globals.css                 # CSS değişkenleri + attainment utility sınıfları
│   ├── dersler/[courseId]/
│   │   ├── page.tsx                # Ders detayı: PÇ + ÖÇ tabloları
│   │   ├── LOMapClient.tsx         # 'use client' — ÖÇ→Soru eşleme düzenleme
│   │   ├── actions.ts              # 'use server' — saveLOLabel/saveItemWeight/savePOContrib
│   │   └── notlar/
│   │       ├── page.tsx
│   │       ├── GradeEntryClient.tsx  # 'use client' — blur'da otomatik kayıt
│   │       └── actions.ts            # 'use server' — saveScore
│   ├── kanitlar/
│   │   ├── page.tsx
│   │   └── EvidenceUploadClient.tsx
│   ├── bbo/
│   │   ├── page.tsx
│   │   └── BBODownloadButton.tsx
│   └── api/
│       ├── upload/route.ts         # POST — dosya yükleme → uploads/
│       ├── scores/route.ts         # POST — puan kaydetme
│       └── bbo/route.ts            # GET — ZIP stream
├── components/
│   ├── Sidebar.tsx                 # 'use client', fixed w-64 nav
│   └── ui/                         # shadcn/ui bileşenleri
└── lib/
    ├── types.ts                    # Tüm domain tipleri
    ├── store.ts                    # Bellek içi tekil nesne + JSON kalıcılığı
    ├── engine.ts                   # Saf ölçüm fonksiyonları (yan etki yok)
    ├── seed.ts                     # Demo veri
    └── utils.ts                    # cn(), round(), formatScore(), bboSafeFilename(), generateDocFilename()
```

## Domain Modeli

### Temel Tipler (`src/lib/types.ts`)

| Tip | Önemli Alanlar |
|-----|----------------|
| `Program` | id, name |
| `Course` | id, code, name, semester, instructors[], programId |
| `Student` | id, name, studentNo — **benzersizlik `studentNo`'dan gelir** (`id` dahili UUID) |
| `Enrollment` | id, studentId, courseId |
| `AssessmentItem` | id, courseId, code, label, group, groupLabel, order, normFactor, maxRaw |
| `LODefinition` | id, courseId, code, label, itemWeights[]{itemId,weight}, poContributions[]{poId,weight} |
| `Score` | id, enrollmentId, itemId, raw: number \| null |
| `EvidenceFile` | id, courseId, originalName, storedName, category, mimeType, sizeBytes, uploadedAt |
| `CurriculumMapEntry` | courseCode, poWeights: Partial<Record<PO_ID, number>> |

### PÇ Tanımlayıcıları

`PO_ID` = `"PO-${1..11}"` template literal tipi. `ALL_POS` dizisi tüm 11 standart çıktıyı listeler; Türkçe etiketler `PO_LABELS`'da.

### Kritik İnvaryant: NULL Semantiği

`null` puan = "ölçülmedi", sıfır değil. Motor, ağırlıklı ortalamalardan null öğeleri dışlar. Bu kural her katmanda zorlanır: store, engine, UI girişleri, golden testler. **Selin Şahin'in null puanları kasıtlıdır — bu invariantı test eder; sıfıra dönüştürme.**

## Ölçüm Motoru (`src/lib/engine.ts`)

Tüm fonksiyonlar saf, NaN döndürmez (null döner).

**Hesap zinciri:**

1. `normScore(item, raw)` → raw / normFactor → 0–5 ölçeği
2. `loScore(lo, itemMap, scoreMap)` → null dışı öğelerin ağırlıklı ortalaması
3. `poScoreStudent(los, loScores)` → ÖÇ ağırlıklarıyla öğrenci başına PÇ puanı
4. `computeCourseResult(...)` → tam ders hesabı; `CourseResult` döner
5. `computeProgramPO(...)` → öğrenci merkezli Ek-2 agregasyonu; program geneli PÇ ortalamaları

**Başarı eşikleri (0–5 ölçeği):**

| Durum | Aralık |
|-------|--------|
| `below` | < 2.5 |
| `border` | 2.5 – 2.99 |
| `above` | ≥ 3.0 |
| `none` | null |

## Durum Yönetimi (`src/lib/store.ts`)

- Tekil bellek nesnesi `_store: StoreData | null`
- Her yazımda `data/store.json`'a `persist()` ile kalıcı hale gelir
- `getStore()` ilk çağrısında JSON'dan yüklenir; dosya yoksa boş store
- İşlem, eşzamanlılık kontrolü yok — MVP kapsamında kasıtlı
- Mutators: `upsertScore()`, `updateLODefinition()`, `addEvidenceFile()`, `resetStore()`

## Server Actions Deseni

Mutasyonlar Client Component'lardan Server Action (`'use server'`) ile yapılır:
- `/dersler/[courseId]/actions.ts` → ÖÇ etiketi, soru ağırlığı, PÇ katkı düzenleme
- `/dersler/[courseId]/notlar/actions.ts` → puan kaydetme

API route'lar (`route.ts`) dosya yükleme (POST) ve BBO ZIP (GET) işler.

## Tasarım Token'ları

`tailwind.config.ts` + `globals.css`:

| Token | Değer |
|-------|-------|
| `primary` | #2B3A8C (lacivert) |
| `canvas` | #F5F7FA |
| `ink` | #161B26 |
| `surface` | #FFFFFF |
| `attainment-below` | #B4490F |
| `attainment-border` | #B8860B |
| `attainment-above` | #0F766E |

CSS utility sınıfları: `.tabular`, `.attain-below`, `.attain-border`, `.attain-above`, `.attain-none`

## Dosya Adlandırma

MÜDEK belge adı kuralı (`generateDocFilename()`):

```
[DersKodu]_[Şube]_[DönemKısa]_[BelgeTipi]_[YYMMDD].[uzantı]
Örnek: EE311_01_S2526_HOMEWORK_1_231015.PDF
```

`bboSafeFilename()` → Türkçe karakterleri ve ASCII olmayan karakterleri `_` ile değiştirir.

## BBO ZIP Dışa Aktarma

`GET /api/bbo` şunları üretir:
- XLSX sayfaları: EK-2_Program_CO_Matrix, EK-2_Student_CO_Table, ders başına ÖÇ puan sayfaları
- `evidence/` klasörü (yüklenen kanıt dosyaları)
- `attachment; filename="mudek-bbo.zip"` olarak stream edilir

## Test

```bash
npm run test
```

`tests/golden.test.ts` → 15 test vakası, seed verisi üzerinde:
- NULL semantiği (Selin'in null puanları sıfıra dönüşmemeli)
- ÖÇ puan hesabı, PÇ puan hesabı, ders ve program seviyesi agregasyon

## Seed Verisi (`src/lib/seed.ts`)

Program: EEM — iki ders, beş sentetik öğrenci:
- **EE311** Sinyaller ve Sistemler: 15 soru (ALE + MT1 + MT2 + Final), 6 ÖÇ
- **EE492** Bitirme Projesi II: 7 soru (IR/FR/PP), 6 ÖÇ
- Öğrenciler: Elif Yılmaz, Mert Demir, Zeynep Kaya, Can Aydın, Selin Şahin

## Phase 0 Kısıtları

- Kimlik doğrulama yok — tek demo kullanıcı
- Veritabanı yok — sunucu yeniden başlatılırsa yazılmamış durum kaybolur (yazımlar anında kalıcı)
- Eşzamanlı güncelleme desteği yok
- Excel import UI'ı bağlı değil
- Sürekli iyileştirme modülü, anketler, dolaylı ölçüm, FBO, çok-program desteği yok
- OBS/ÜBYS/LMS entegrasyonu yok
- `uploads/` ve `data/store.json` gitignore'da — yalnızca çalışma zamanı durumu

## Yol Haritası

Üretim hedef yığını: Next.js + Supabase (PostgreSQL + RLS + Auth + Storage + Edge Functions). TypeScript engine fonksiyonları, ölçüm mantığı değişmeden SQL'e taşınmak üzere tasarlanmıştır. Golden test paketi, TS → SQL geçişinin köprüsü olarak kullanılacaktır.
