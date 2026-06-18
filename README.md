<div align="center">

<img src="public/logo.svg" alt="MÜDEK Ölçüm Sistemi" height="64" />

# MÜDEK PÇ Ölçüm Sistemi

**Mühendislik Program Çıktılarını ölçen, BBO (Bölüm Bilgi Özeti) raporunu tek tıkla üreten akreditasyon aracı.**

[![Next.js](https://img.shields.io/badge/Next.js-15.3-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5_strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Testler](https://img.shields.io/badge/testler-15_geçti-0F766E)](./tests/golden.test.ts)

</div>

---

Sınav sorularını öğrenme çıktılarına, öğrenme çıktılarını program çıktılarına eşleyin; Ek-2 yöntemine göre öğrenci başına atainment puanlarını hesaplayın; BBO ZIP'ini tek tıkla dışa aktarın. Veritabanı, Docker veya ortam değişkeni gerekmez.

## Özellikler

| | |
|---|---|
| **Program Çıktısı Panosu** | Tüm derslerde renk kodlu (altında / sınırda / üstünde) 11 PÇ atainment matrisi |
| **Ders Detayı** | ÖÇ–soru eşleme editörü, ağırlık yapılandırması, PÇ katkı matrisi |
| **Not Girişi** | Öğrenci × soru bazlı, blur'da otomatik kayıt; `null` = ölçülmedi, sıfır değil |
| **Kanıt Yönetimi** | Kanıt dosyası yükleme ve kategorileme; dosya adları MÜDEK kuralına göre otomatik oluşturulur |
| **BBO Dışa Aktarma** | Tek tıkla ZIP: Ek-2 XLSX sayfaları + tüm kanıt dosyaları, stream olarak sunulur |
| **Saf Hesap Motoru** | Yan etkisiz TypeScript fonksiyon zinciri; tasarımı gereği NaN döndürmez |

## Hızlı Başlangıç

Ortam değişkeni yok. Docker yok. Veritabanı yok.

```bash
git clone <repo> && cd mudek-pc-olcum
npm install
npm run dev        # → http://localhost:3000
```

`data/store.json` ilk çalıştırmada otomatik olarak EEM programı, 2 ders ve 5 öğrenciden oluşan demo veriyle doldurulur. Sıfırlamak için dosyayı silin.

```bash
npm run test       # Vitest ile 15 golden test
npm run build      # Üretim build'i
npm run start      # Üretim build'ini servis et
```

## Teknoloji Yığını

| Katman | Tercih | Not |
|---|---|---|
| Framework | Next.js 15 App Router | Mutasyonlar Server Action ile yapılır |
| Dil | TypeScript 5 strict | `PO-${1..11}` template-literal tipi |
| UI | React 19 + Radix UI + Tailwind 3.4 | shadcn/ui bileşen deseni |
| Hesap tablosu | xlsx (sunucu tarafı) | Ek-2 XLSX üretimi |
| Arşiv | JSZip | BBO ZIP stream |
| Test | Vitest 3.1 | Node ortamı, globals |
| Durum | Bellek içi tekil + JSON | `data/store.json` kalıcılığı |

## Mimari

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router                                         │
│                                                             │
│  page.tsx (RSC)  ──okur──▶  store.ts  ◀──yazar──  actions.ts ('use server')
│                                  │                          │
│                              persist()                  LOMapClient
│                                  │                     GradeEntryClient
│                                  ▼                          │
│                           data/store.json               ('use client')
│                                                             │
│  /api/bbo  ──▶  engine.ts  ──▶  xlsx + jszip  ──▶  ZIP stream
└─────────────────────────────────────────────────────────────┘
```

Mutasyonlar yalnızca Server Action üzerinden akar. API route'lar dosya yüklemeyi (`POST /api/upload`) ve BBO dışa aktarmayı (`GET /api/bbo`) üstlenir. Tüm hesap mantığı `engine.ts` içinde yaşar — saf fonksiyonlar, I/O yok.

## Hesap Motoru

`src/lib/engine.ts` — saf fonksiyonlardan oluşan bir zincir. Yan etki yok, NaN dönmez.

```
ham puan
  └─ normScore(item, raw)             → 0–5 ölçeği  (ham ÷ normFactor)
       └─ loScore(lo, items, scores)  → ÖÇ başına ağırlıklı ortalama
            └─ poScoreStudent(...)    → öğrenci başına PÇ puanı
                 └─ computeCourseResult(...)  → tam ders sonuç matrisi
                      └─ computeProgramPO()  → Ek-2 öğrenci merkezli agregasyon
```

### Null Semantiği

`null` **ölçülmedi** anlamına gelir — sıfır değil. Null öğeler motor fonksiyonlarında, store mutasyonlarında, UI girdilerinde ve 15 golden testin tamamında ağırlıklı ortalamadan sessizce dışlanır.

> **İnvaryant:** `null` puanları asla `0`'a dönüştürme. Golden test paketi, bu sınırı korumak için Selin Şahin'in bilinçli olarak null bırakılmış puanlarını kullanır.

### Atainment Eşikleri (0–5 ölçeği)

| Durum | Aralık | Renk |
|---|---|---|
| `above` — üstünde | ≥ 3,0 | Yeşil |
| `border` — sınırda | 2,5 – 2,99 | Amber |
| `below` — altında | < 2,5 | Kırmızı |
| `unmeasured` — ölçülmedi | `null` | — |

## Domain Modeli

| Tip | Önemli Alanlar |
|---|---|
| `Program` | id, name, code, curriculumMap |
| `Course` | id, code, name, semester, instructors, sections |
| `Student` | id, studentNo, name — benzersizlik `studentNo`'dan gelir (`id` dahili UUID) |
| `Enrollment` | id, studentId, courseId, section |
| `AssessmentItem` | id, code, group, normFactor, maxRaw |
| `LODefinition` | id, code, itemWeights[], poContributions[] |
| `Score` | id, enrollmentId, itemId, raw: `number \| null` |
| `EvidenceFile` | id, courseId, originalName, storedName, category |
| `CurriculumMapEntry` | courseCode, poWeights: `Partial<Record<PO_ID, number>>` |

`PO_ID`, TypeScript template literal tipidir: `` `PO-${1..11}` ``. 11 standart MÜDEK çıktısının tamamı `ALL_POS` dizisinde listelenmiştir.

## Dizin Yapısı

```
src/
├── app/
│   ├── layout.tsx                    # Kök layout: Sidebar + main
│   ├── page.tsx                      # Pano — program PÇ matrisi
│   ├── dersler/[courseId]/
│   │   ├── page.tsx                  # Ders detayı: PÇ + ÖÇ tabloları
│   │   ├── LOMapClient.tsx           # ÖÇ → soru eşleme editörü (istemci)
│   │   ├── actions.ts                # saveLOLabel / saveItemWeight / savePOContrib
│   │   └── notlar/
│   │       ├── GradeEntryClient.tsx  # Blur'da otomatik kayıtlı not girişi (istemci)
│   │       └── actions.ts            # saveScore
│   ├── kanitlar/                     # Kanıt yükleme arayüzü
│   ├── bbo/                          # BBO dışa aktarma sayfası
│   └── api/
│       ├── upload/route.ts           # POST — dosya yükleme → uploads/
│       ├── scores/route.ts           # POST — puan kalıcılığı
│       └── bbo/route.ts              # GET — ZIP stream
├── components/
│   ├── Sidebar.tsx                   # Sabit 256 px gezinme çubuğu (istemci)
│   └── ui/                           # Radix destekli shadcn/ui bileşenleri
└── lib/
    ├── types.ts                      # Tüm domain tipleri + attainmentLevel()
    ├── engine.ts                     # Saf hesap fonksiyonları
    ├── store.ts                      # Bellek içi tekil nesne + JSON kalıcılığı
    ├── seed.ts                       # Demo veri (EEM programı)
    └── utils.ts                      # cn(), round(), formatScore(), dosya adı yardımcıları
```

## BBO Dışa Aktarma

**BBO (Bölüm Bilgi Özeti)**, MÜDEK akreditasyon sürecinde programların ziyaret öncesi hazırladığı öz-değerlendirme belgesidir. Program çıktısı ölçüm verileri, kanıt dosyaları ve Ek-2 tabloları BBO'nun temel bileşenlerini oluşturur.

`GET /api/bbo`, `mudek-bbo.zip` adında bir ZIP stream'i döner:

```
mudek-bbo.zip
├── EK-2_Program_CO_Matrix.xlsx       # 11 PÇ × N ders atainment ızgarası
├── EK-2_Student_CO_Table.xlsx        # Öğrenci bazlı PÇ puanları (Ek-2 formatı)
├── [DersKodu]_LO_Scores.xlsx         # Her ders için ayrı sayfa
└── evidence/
    └── [MÜDEK formatlı dosya adları] # Yüklenen tüm kanıt dosyaları
```

Dosya adları MÜDEK belge adlandırma kuralına uyar ([MÜDEK Belge ve Formlar](https://www.mudek.org.tr/tr/belge/doc.shtm)):

```
[DersKodu]_[Şube]_[DönemKısa]_[BelgeTipi]_[YYAAGG].[UZN]
Örnek: EE311_01_S2526_HOMEWORK_1_231015.PDF
```

## Tasarım Token'ları

| Token | Değer | Kullanım |
|---|---|---|
| `primary` | `#2B3A8C` | Gezinme, başlıklar |
| `canvas` | `#F5F7FA` | Sayfa arkaplanı |
| `ink` | `#161B26` | Gövde metni |
| `attainment-above` | `#0F766E` | Yeşil — eşik üstü |
| `attainment-border` | `#B8860B` | Amber — sınırda |
| `attainment-below` | `#B4490F` | Kırmızı — eşik altı |

CSS yardımcı sınıfları: `.tabular`, `.attain-above`, `.attain-border`, `.attain-below`, `.attain-none`

## Demo Veri

**EEM** programı iki ders ve beş öğrenciyle gelir:

| Ders | Sorular | ÖÇ |
|---|---|---|
| EE311 Sinyaller ve Sistemler | 15 (ALE + MT1 + MT2 + Final) | 6 |
| EE492 Bitirme Projesi II | 7 (IR / FR / PP) | 6 |

Öğrenciler: Elif Yılmaz, Mert Demir, Zeynep Kaya, Can Aydın, Selin Şahin  
Selin Şahin'in puanları, null semantiği invariantını test etmek için bilinçli olarak `null` bırakılmıştır.

## Test

```bash
npm run test
```

`tests/golden.test.ts` — seed verisi üzerinde 15 test vakası:

- **Null semantiği** — null puanlar asla sıfıra dönüşmemeli
- **ÖÇ puan hesabı** — kısmi ölçümle ağırlıklı ortalama
- **PÇ puan hesabı** — öğrenci ve ders bazında
- **Ders seviyesi agregasyon** — kayıtlı öğrenciler arasında ortalama
- **Program seviyesi agregasyon** — Ek-2 öğrenci merkezli çapraz ders toplaması

Test paketi, planlanan TS → SQL geçişinin köprüsü olarak kullanılacaktır.

## Yol Haritası

Hedef üretim yığını: **Next.js + Supabase** (PostgreSQL + RLS + Auth + Storage + Edge Functions). Motor'un saf fonksiyonları, ölçüm mantığı değişmeden SQL'e taşınmak üzere tasarlanmıştır.

| Aşama | Durum | Kapsam |
|---|---|---|
| **0** | ✅ Mevcut | Bellek içi store, tek kullanıcı, demo veri |
| **1** | Planlandı | Supabase backend, kimlik doğrulama, çok kullanıcı |
| **2** | Planlandı | Excel import, dolaylı ölçüm, FBO modülü |
| **3** | Planlandı | Çok program desteği, OBS/ÜBYS/LMS entegrasyonu, sürekli iyileştirme |

### Aşama 0 Kısıtları

- Kimlik doğrulama yok — tek demo kullanıcı
- Veritabanı yok — yazılmamış durum sunucu yeniden başlatılırsa kaybolur (yazımlar anlıktır)
- Eşzamanlı güncelleme desteği yok
- Excel import arayüzü bağlı değil
- `uploads/` ve `data/store.json` gitignore'dadır — yalnızca çalışma zamanı durumu

---

<div align="center">

[MÜDEK](https://www.mudek.org.tr) akreditasyon süreçleri için geliştirildi · Türkiye Mühendislik Program Değerlendirme Kurulu  
Belge ve formlar: [mudek.org.tr/tr/belge/doc.shtm](https://www.mudek.org.tr/tr/belge/doc.shtm)

</div>
