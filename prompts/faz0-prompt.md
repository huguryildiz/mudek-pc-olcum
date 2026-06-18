# Faz 0 — Çalışan MVP Demo Build Promptu

> **Amaç:** `prompt.md`'deki tasarımın **tek dikey dilimini** gerçek, çalışan bir uygulamaya dönüştürmek. Bu prompt tasarım istemez; **kod üretir ve çalıştırır.** Sonunda `npm run dev` ile açılan, tüm değer zincirini gösteren bir demo olmalıdır.

> **DB yok (bilinçli karar):** Faz 0 bir demodur; amacı üretim mimarisini değil **ürün değer zincirini** göstermektir. Bu yüzden veritabanı, Docker, migration **kullanılmaz** — durum bellek/JSON içinde tutulur. Ölçüm motoru `prompt.md` G.1'deki **saf fonksiyon** ilkesiyle (`sonuç = f(ham, eşleme, konfig)`) **TypeScript'te** yazılır. Bu motor üretimde SQL'e yeniden yazılacaktır; **`refs/EE311-PO.xlsx` ve `refs/EE492-PO.xlsx` golden-testi iki implementasyon arasındaki köprüdür** (mantık taşınır, kod taşınmaz — demo için kabul edilir).

> **İki veri kümesi (karıştırma):**
> - **Golden-test fikstürü (gerçek):** `refs/EE311-PO.xlsx` ve `refs/EE492-PO.xlsx`. Yalnızca testte kullanılır, **UI'da gösterilmez** (gerçek kişisel veri içerir). Motorun Excel ile aynı sonucu verdiğini kanıtlar.
> - **Demo seed (sentetik):** UI'da görünen veri. **5 sentetik öğrenci**, ikisi de **aynı 5 öğrenci** olmak üzere EE 311 ve EE 492 derslerinde; uydurma Türkçe ad-soyad, uydurma değerlendirme kalemleri ve notlar. KVKK-güvenli ve öğrenci-merkezli toplulaştırmayı (dersler-arası) net gösterir.

Sen kıdemli bir full-stack geliştiricisin. Aşağıdaki kapsamı **olduğu gibi** uygula; kapsamı genişletme. Belirsizlikte en basit çalışan çözümü seç ve varsayımını not et.

---

## 0. Bağlam ve Referanslar

- Ürün tasarımı: bu repodaki `prompt.md` (tam spec). Çelişki olursa `prompt.md` esastır.
- Hesaplama referansı (golden, test-only): `refs/EE311-PO.xlsx`, `refs/EE492-PO.xlsx`
- Müfredat haritası: `refs/course-po-matrix.md`
- MÜDEK yapısı: `refs/sanal-belge-odasi.pdf`, `refs/degerlendirme-olcutleri.pdf`
- Dosya adlandırma + ders dosyası klasör yapısı: `refs/doc-format.pdf` (bkz. `prompt.md` Bölüm 2 + 6)
- Ölçüm motoru mimarisi: `prompt.md` → **Bölüm 3, G.1, Ek-1, Ek-2, Ek-3**
- Arayüz ve tüm çıktı dili: **Türkçe**.

---

## 1. Faz 0'ın Demo Hedefi (tek cümle)

> Bir kullanıcı ham notları görür/içe aktarır → program çıktısı (PÇ) başarı dashboard'unu eşik renklendirmesiyle görür → bir PÇ skoruna tıklayıp ham nota kadar iner → bir kanıt dosyası yükler → MÜDEK Sanal Bölüm Belge Odası (BBO) klasörünü ZIP olarak indirir.

Bu 4 adım uçtan uca çalışıyorsa Faz 0 tamamlanmıştır.

---

## 2. Kapsam

### Kapsam İÇİ (yapılacak)

1. **Proje iskelesi:** Next.js (App Router, TypeScript). **Veritabanı yok** — durum bellek/JSON içinde. `npm run dev` ile tek komutla ayağa kalkmalı.
2. **Veri yapıları:** §4'teki varlıklar TypeScript tipleri olarak; başlangıç verisi JSON seed.
3. **Demo seed (tamamen sentetik):** İki ders + `course-po-matrix.md`'den ilgili program müfredat satırları.
   - **5 ortak öğrenci:** İkisi de aynı 5 öğrenci olmak üzere **EE 311** ve **EE 492** derslerine kayıtlı; **uydurma Türkçe ad-soyad** (ör. "Elif Yılmaz", "Mert Demir", "Zeynep Kaya", "Can Aydın", "Selin Şahin") ve sıralı sahte numara. Tam örtüşme → öğrenci-merkezli program PÇ toplulaştırması (bir öğrencinin dersler-arası tek PÇ değeri) net görünür (`prompt.md` Bölüm 3 + Ek-2).
   - **Değerlendirme kalemleri uydurulur:**
     - **EE 311 (sınav/ödev temelli):** ör. 2 ödev/ALE + 2 vize (Q1–Q4) + final (Q1–Q4); makul max puan ve %ağırlıklar.
     - **EE 492 (Bitirme Projesi — rapor/poster temelli):** ör. Ara Rapor + Final Rapor + Poster Sunumu kalemleri. Bu, **modüler ölçme araçlarını** (farklı kalem türleri) da gösterir.
   - **ÖÇ ve ÖÇ→PÇ katkı matrisi** her ders için makul biçimde tanımlanır (katkı düzeyleri 0/.25/.5/.75/1); iki ders farklı PÇ kümelerine katkı vermeli ki program toplulaştırması anlamlı olsun.
   - Notlar makul aralıkta uydurulur; **en az bir kalem bilinçli olarak boş (NULL)** bırakılır ki "ölçülmedi ≠ 0" davranışı demoda görünsün.
4. **Excel içe aktarma:** Ham not sayfalarını okuyan içe aktarma özelliği; normalize/PÇ sayfaları **göz ardı edilir** (motor hesaplar). Bkz. `prompt.md` Bölüm 2. Demo, gerçek `refs/EE311-PO.xlsx` / `refs/EE492-PO.xlsx`'ten **ham notların** okunabildiğini gösterebilir; ancak UI/seed sentetik veriyle çalışır.
4b. **Soru bazlı not girişi:** Not girişi ekranı, ölçme aracının **soru/alt-kalem düzeyinde** giriş yapılabilmesini sağlamalı — ör. *Midterm Exam-I → Soru 1, 2, 3 …*, her öğrenci için soru bazında ham puan. **Her soru ayrı bir ÖÇ'ye ve dolayısıyla farklı bir PÇ'ye eşlenebilir**; ÖÇ/PÇ hesabı bu **soru-düzeyi eşlemelerden** gelir (toplu sınav notundan değil). Eşleme (soru→ÖÇ ve ÖÇ→PÇ) seed'de tanımlı; ekranda görünür olmalı.
5. **Ölçüm motoru:** **TypeScript saf fonksiyonları** olarak G.1 hesap zinciri (`sonuç = f(ham, eşleme, konfig)`); **NULL semantiği** ("ölçülmedi ≠ 0") uygulanır. Program düzeyi PÇ **öğrenci-merkezli** hesaplanır (bkz. `prompt.md` Ek-2).
6. **Dashboard:** Ders bazlı PÇ başarı tablosu/grafiği (eşik altı kırmızı); **öğrenci-merkezli** program PÇ tablosu; PÇ → ÖÇ → kalem → ham not **drill-down**. Bir öğrencinin tek PÇ-k değerinin iki dersten nasıl geldiği de gezilebilmeli.
7. **Kanıt yükleme:** Yerel dosya sistemine (ör. `./uploads`) yazma; **otomatik dosya adı `refs/doc-format.pdf` formatında** (`[Ders Kodu]_[Şube]_[Dönem]_[Belge Türü veya Etkinlik]_[YYMMDD].PDF`; öğrenci belgesinde `_A.YILMAZ`), Türkçe karaktersiz ad, tür/boyut doğrulaması, belge-türüne göre uzantı (PDF / GRADES→XLSX / sunum→PPTX); metadata bellek/JSON'da (ölçüt/MÇ/ders ilişkisi).
8. **BBO ZIP dışa aktarma:** `prompt.md` Bölüm 5'teki resmi BBO ağacı (numara önekli, ASCII adlı dizinler, `3 - Program Ciktilari` altında MÇ-1…11), her dizin için otomatik `Icindekiler` dosyası, ZIP (içerik sıkıştırmasız).
9. **Golden test (test-only):** `refs/EE311-PO.xlsx` **ve** `refs/EE492-PO.xlsx`'teki gerçek ham notlarla motor çıktısı, Excel'in hesapladığı ÖÇ/PÇ değerleriyle (NULL→0 uyumluluk modunda) ondalık hassasiyette eşleşmeli. Bu test fikstürü UI'da kullanılmaz (gerçek kişisel veri).

### Kapsam DIŞI (Faz 0'da YAPMA)

- **Veritabanı, Docker, migration, kalıcı depolama** — bellek/JSON yeterli (yeniden başlatınca veri uçabilir, demo için sorun değil).
- Gerçek kimlik doğrulama/SSO, RLS, 8 rol — tek "demo kullanıcı" yeter (auth kapısı yok veya sabit oturum). Not olarak belirt.
- Anket / dolaylı ölçüm / Program Eğitim Amaçları (Bölüm 4A)
- Sürekli iyileştirme modülü (Bölüm 4)
- FBO, "30-Gün Yanıtı", çok programlılık
- OBS/ÜBYS ve LMS entegrasyonu
- Tam audit log (yalnızca import ve export için basit kayıt yeter)
- Çok dillilik (yalnızca Türkçe)
- Ölçme aracı türlerinin tam yönetim arayüzü (seed yeterli)

---

## 3. Teknoloji (sabit)

- **Frontend:** Next.js (App Router) + TypeScript + **Tailwind CSS + shadcn/ui**. Premium SaaS hissi — bkz. §3A.
- **Backend:** Next.js API/route handler'ları; **veritabanı yok**. Durum: bellek (modül seviyesi store) veya tek `data.json` dosyası.
- **Hesap:** **TypeScript saf fonksiyonları** (girdi→çıktı, yan etkisiz). Üretimde Postgres SQL'e taşınacak; golden-test köprüdür.
- **Excel:** sunucu tarafında okuma (ör. `xlsx`/`exceljs`).
- **ZIP:** sunucu tarafında üretim (ör. `archiver`/`jszip`), Türkçe karaktersiz yollarla.
- **UI bileşenleri:** **Tailwind CSS + shadcn/ui** (Radix primitifleri). Tablolar, kartlar, dialog, sheet, badge, tooltip, breadcrumb için shadcn bileşenleri.
- **Dağıtım (opsiyonel):** Vercel'e tek tıkla deploy edilebilir olmalı (DB bağımlılığı olmadığı için).

---

## 3A. Arayüz Tasarımı — Premium SaaS Yönergesi

Hedef: **premium, ciddi bir SaaS** hissi. shadcn/ui temel alınır **ama default shadcn şablonu gibi durmamalı** — varsayılan slate teması, jenerik landing kalıbı ve "AI-üretimi" klişeleri (krem+serif+terracotta; siyah+asit-yeşil aksan; gazete hairline) **kullanılmaz**. Tasarım konuya bağlanır: bu bir **ölçüm ve kanıt aracı** — güven, hassasiyet ve okunabilirlik öne çıkar; gösterişten çok netlik.

- **Karakter:** Bir analitik/ölçüm enstrümanı gibi — sakin, veri-yoğun ama nefes alan; Linear/Vercel düzeyinde cila, kurumsal ağırbaşlılıkla. Açık tema varsayılan (uzun oturumlarda okunur).
- **Renk (öneri token'ları, yapılandırılabilir):**
  - Yüzey `#FFFFFF`, kanvas `#F5F7FA`, metin-mürekkep `#161B26`, ikincil metin `#5B6472`, kenarlık `#E3E7ED`.
  - Marka/birincil: derin indigo `#2B3A8C` (kurumsal, güven). Tek aksan; her yere serpiştirme.
  - **Başarı (attainment) skalası — jenerik kırmızı/yeşil değil, kalibre edilmiş:** eşik-altı = kiremit/amber `#B4490F`, sınırda = nötr kehribar `#B8860B` tonu, eşik-üstü = sakin teal-yeşil `#0F766E`. Skala bilinçli ve tutarlı; renk + sayı + (gerekirse) ikon birlikte (yalnız renge güvenme — erişilebilirlik).
- **Tipografi:**
  - Display: karakterli ama profesyonel bir grotesk (ör. **Geist** veya **General Sans**) — başlıklarda ölçülü.
  - Gövde: okunur bir sans (ör. **Inter**).
  - **Sayısal veriler için tabular/mono rakamlar zorunlu** (ör. **Geist Mono** / `font-variant-numeric: tabular-nums`) — bu bir sayı aracı; skorlar, notlar, eşikler hizalı olmalı.
- **Layout:** Uygulama kabuğu — sol sakin sidebar (program/ders gezinme), üstte ince breadcrumb, ana alan veri-yoğun. Kartlar yumuşak gölge + 8–12px radius; cömert beyaz alan; net tip ölçeği.
- **İmza öğesi (sayfanın aklında kalanı):** **PÇ Başarı Matrisi** — MÇ × ders/öğrenci ızgarası; her hücre kalibre skala ile renklenir ve **tıklanınca kanıta kadar iner** (her sayı bir kanıta bağlı tezini görselleştirir). Cilayı burada harca; gerisi sakin kalsın.
- **Hareket:** Ölçülü — sayfa yükleme/skroll reveal'de zarif geçişler, hover mikro-etkileşimler; abartı yok (`prefers-reduced-motion` saygılı).
- **Yazı/kopya:** Türkçe, sade, aktif dil; buton ne yapıyorsa onu söyler ("Kanıt yükle", "BBO'yu indir"). Boş/hata durumları yön verir ("Henüz ölçme kalemi eklenmedi — Excel içe aktar veya elle ekle").
- **Kalite tabanı:** mobile'a kadar responsive, görünür klavye odağı, yeterli kontrast, boş/hata/yükleniyor durumları tasarlı.

---

## 4. Asgari Veri Modeli (TypeScript tipleri — yalnızca bunlar)

`prompt.md` Bölüm 10'un alt kümesi; tablo değil, **bellekteki tipler/koleksiyonlar**:

```
Program(id, ad)
ProgramOutcome(id, programId, no, ad)               -- MÇ-1..11
Course(id, kod, ad)
CourseOffering(id, courseId, programId, donem, ogretimUyesi)
LearningOutcome(id, offeringId, kod)                -- ÖÇ
AssessmentItem(id, offeringId, ad, maxScore, weightPct)
Student(id, noMasked, ad)
StudentScore(itemId, studentId, rawScore: number | null)   -- null = girilmedi
ItemCloMap(itemId, cloId)                           -- kalem→ÖÇ (M:N)
CloPoContrib(cloId, poId, level)                    -- 0/.25/.5/.75/1
CoursePoContrib(offeringId, poId, weight)           -- müfredat haritası
AttainmentConfig(offeringId, scale, thresholdKind, thresholdValue)
EvidenceFile(id, filePath, dosyaAdi, olcut, mcNo, offeringId, itemId, yuklenmeTarihi)
ImportLog(id, kaynak, ozet, hash, tarih)
```

Hesap katmanları **saf fonksiyonlar** olarak (`prompt.md` G.1, Ek-1/Ek-2):
`normScore()` → `loScore()` → `poScoreStudent()` → `poCourse()` → `poProgram()`.
Her fonksiyon girdisini parametre alır, global duruma dokunmaz (test edilebilirlik için).

---

## 5. Yapılacaklar (sırayla)

1. Repo iskeleti + `npm run dev` çalışır hale getir (DB yok); `README` ile çalıştırma adımları.
2. §4 tipleri + bellek/JSON store + hesap saf fonksiyonları (NULL semantiği; `IFERROR→0` / `AVERAGEIF<>0` **kullanma**).
3. Sentetik seed (5 ortak öğrenci + EE 311 & EE 492 + uydurma kalemler/notlar) + ham not import endpoint'i. Öğrenci no maskeleme (`134*****238` biçimi).
4. Dashboard sayfası: PÇ başarı tablosu (skor + eşik altı oranı), eşik renklendirmesi, öğrenci-merkezli program PÇ, drill-down.
5. Kanıt yükleme sayfası: dosya adı/tür/boyut kuralları + metadata + yerel dosyaya yazma.
6. BBO ZIP export endpoint'i + indir butonu; `Icindekiler` üretimi; ASCII yol doğrulaması.
7. Golden test (gerçek EE311/EE492 Excel ↔ motor, test-only).

---

## 6. Kabul Kriterleri (Faz 0 "bitti" tanımı)

- [ ] `npm install` + `npm run dev` ile uygulama tek komutta açılıyor (DB/Docker kurulumu gerekmiyor).
- [ ] Sentetik seed (5 ortak öğrenci, EE 311 + EE 492) yükleniyor; ham notlar görünüyor; içe aktarmada normalize/PÇ sayfaları girdi olarak **kullanılmıyor**.
- [ ] Not girişi **soru bazlı** yapılabiliyor (Midterm Soru 1/2/3…); her sorunun farklı ÖÇ/PÇ'ye eşlendiği görülüyor ve hesaba soru düzeyinde yansıyor.
- [ ] Dashboard ders ve program bazlı PÇ skorlarını gösteriyor; eşik altı kırmızı; eşik altı öğrenci oranı görünüyor.
- [ ] Program bazlı PÇ **öğrenci-merkezli** gösteriliyor; bir öğrencinin tek PÇ-k değerinin iki dersten geldiği gezilebiliyor.
- [ ] Bir PÇ skorundan ham nota kadar drill-down çalışıyor.
- [ ] Kanıt yüklenince `doc-format.pdf` formatında ad üretiliyor (`Ders_Şube_Dönem_Tür_YYMMDD`); Türkçe karakter ve hatalı tür/boyut reddediliyor.
- [ ] BBO ZIP indiriliyor; açıldığında `prompt.md` Bölüm 5 ağacı, ASCII adlar, MÇ-1…11 ve `Icindekiler` dosyaları var.
- [ ] Golden test geçiyor (gerçek EE311 **ve** EE492 Excel ile ondalık eşleşme, uyumluluk modunda).
- [ ] "Ölçülmedi ≠ 0 aldı": eksik notlu bir kalemde sonuç sıfıra çekilmiyor (test ile gösteriliyor).

---

## 7. Demo Senaryosu (sunumda tıklanacak akış)

1. **Veri** → seed yüklü: "5 öğrenci, EE 311 + EE 492" (istenirse gerçek Excel'den ham not import'u göster).
2. **Dashboard** → PÇ-1…11 başarı tablosu; bir PÇ eşik altı (kırmızı); program PÇ **öğrenci-merkezli** (iki ders birleşik).
3. **Drill-down** → kırmızı PÇ'ye tıkla → katkı veren ÖÇ'ler → kalemler → bir öğrencinin ham notu; bir öğrencinin PÇ-k'sının **iki dersten** nasıl geldiğini göster.
4. **Kanıt yükle** → bir PDF yükle → otomatik ad ör. `EE311_01_S2526_HOMEWORK_1_231015.PDF` (EE 492 için `..._IR_A.YILMAZ_...` / `..._PP_...PPTX`).
5. **Dışa aktar** → "BBO ZIP indir" → klasör ağacını göster.

---

## 8. Teslim

- Çalışan kod + `README` (kurulum/çalıştırma — yalnızca `npm install` + `npm run dev`).
- Hesap motoru saf fonksiyonları + seed/JSON verisi.
- Golden test ve nasıl çalıştırılacağı.
- Kısa "bilinen sınırlamalar" notu (kapsam dışı bırakılanlar + auth basitleştirmesi).

> Çıktı: tasarım dokümanı değil, **çalışan demo**. Önce iskeleti ayağa kaldır, sonra her adımı uçtan uca bitirip bir sonrakine geç (yatay değil, dikey ilerle).
