# MÜDEK Uyumlu Akreditasyon Yönetim Sistemi İçin Ürün ve Mimari Tasarım Promptu

Sen deneyimli bir full-stack yazılım mimarı, ürün yöneticisi ve MÜDEK/ABET benzeri akreditasyon süreçlerini bilen bir eğitim kalite güvence uzmanısın.

Amacım, mühendislik bölümleri için MÜDEK uyumlu bir web uygulaması geliştirmek. Uygulama, öğretim üyelerinden ders dosyalarını, ölçme araçlarını, notlandırma bilgilerini ve öğrenci performans verilerini toplamalı; bu verileri program çıktılarıyla ilişkilendirmeli; program çıktısı erişim düzeylerini hesaplamalı; eksik kanıtları göstermeli; sürekli iyileştirme kararlarını takip etmeli; gerektiğinde MÜDEK Sanal Belge Odası yapısına uygun çıktı üretebilmelidir.

Uygulama MÜDEK’in temel mantığına göre tasarlanmalıdır.

---

## 1. Program Çıktıları

- MÜDEK’in 11 program çıktısı (MÇ) sistemde varsayılan olarak bulunmalıdır. Resmi metin `refs/degerlendirme-olcutleri.pdf` (Ölçüt 3, Tablo 3.1) ile uyumludur ve 4 ana grup altında düzenlenmiştir:

  **Mühendisler için Temel Nitelikler**
  1. Mühendislik Bilgisi
  2. Problem Analizi
  3. Mühendislik Tasarımı

  **Mühendislik Problemlerini İnceleme Araç ve Yöntemleri**
  4. Teknik ve Araçların Kullanımı
  5. Araştırma ve İnceleme

  **Mühendislik Uygulamalarının Etkileri**
  6. Mühendislik Uygulamalarının Küresel Etkisi
  7. Mühendislik Etiği

  **Bireysel ve Yönetimsel Nitelikler**
  8. Bireysel ve Takım Çalışması
  9. Sözlü ve Yazılı İletişim
  10. Proje Yönetimi
  11. Yaşam Boyu Öğrenme

- Tam çıktı tanımları (beceri/bilgi/farkındalık bileşenleri ile) `refs/degerlendirme-olcutleri.pdf` Tablo 3.1'den birebir alınmalıdır.
- **Önemli ayrım:** Program Çıktıları (MÇ), **mezuniyet aşamasına gelmiş** öğrencilerin erişim düzeyi üzerinden ölçülür. Program Eğitim Amaçları (Ölçüt 2) ise **son 3–5 yıldaki mezunlar** üzerinden değerlendirilir; sistem bu iki kavramı ayrı tutmalıdır.
- Her program kendi program çıktılarını tanımlayabilmeli ve bunları MÜDEK çıktılarıyla eşleyebilmelidir (kendi çıktıları 11 MÇ'nin tümünü kapsamak zorundadır).
- Çıktılar gerektiğinde alt bileşenlere ayrılabilmelidir.
- Her çıktı veya alt çıktı için başarı eşiği tanımlanabilmelidir.
- Ders öğrenme çıktısı (ÖÇ) ile program çıktısı (PÇ) arasındaki ilişki bir **katkı düzeyi matrisi** ile tanımlanmalıdır. Varsayılan katkı düzeyleri ve sayısal karşılıkları:
  - Yok = 0
  - Düşük = 0.25
  - Orta = 0.5
  - Yüksek = 0.75
  - Çok Yüksek = 1.0
- Bu katkı düzeyleri ölçüm motorunda ÖÇ→PÇ ağırlıklandırmasında kullanılır (bkz. Bölüm 3 ve Ek-1).
- **Katkı düzeyi matrisi tamamen düzenlenebilir (editable) olmalıdır:**
  - Matris hücreleri (her ÖÇ–PÇ kesişimi) yetkili kullanıcı tarafından arayüzden düzenlenebilmelidir.
  - Katkı düzeyi etiketleri ve sayısal karşılıkları (yukarıdaki ölçek) yapılandırılabilir olmalı; ek düzey eklenip çıkarılabilmelidir.
  - Aynı şekilde **program müfredat haritası** (Ders × PÇ katkı matrisi, bkz. `refs/course-po-matrix.md`) de düzenlenebilir olmalıdır.
  - Matris değişiklikleri **versiyonlanmalı** (kim, ne zaman, hangi değer) ve audit log'a yazılmalıdır; geçmiş dönemlerin hesapları o dönemde geçerli matris sürümüyle korunmalıdır (geriye dönük bozulma olmamalıdır).

---

## 2. Ders Dosyası Yönetimi

Her ders için şu bilgiler tutulmalıdır:

- Ders kodu, ders adı, dönem, öğretim üyesi
- Ders izlencesi
- Ders öğrenme çıktıları
- Ders öğrenme çıktısı - program çıktısı matrisi
- **Ölçme araçları (modüler):** Ölçme araçları türleri sabit kodlanmamalı, **yapılandırılabilir** olmalıdır. Aşağıdaki liste **varsayılan** türlerdir; öğretim üyesi/koordinatör sonradan tür **ekleyip çıkarabilmeli**, yeniden adlandırabilmeli ve ders bazında etkin/pasif yapabilmelidir:
  - Sınav
  - Quiz
  - Ödev
  - Laboratuvar
  - Proje
  - Sunum
  - Rapor
  - Staj
  - Seminer
  - Yoklama
  - Her ölçme aracı bir veya birden çok **alt kalemden** (ör. sınav soruları Q1–Q4) oluşabilmeli; her kaleme ağırlık (%) ve ölçek (azami puan) tanımlanabilmelidir.
  - Tür eklenip çıkarıldığında mevcut veriler ve geçmiş dönem hesaplamaları bozulmamalıdır (yumuşak silme/versiyonlama).
- **Soru bazlı not girişi (zorunlu):** Not girişi, ölçme aracının **alt kalemi/sorusu düzeyinde** yapılabilmelidir — ör. *Midterm Exam-I → Soru 1, Soru 2, Soru 3 …*. Her soru için öğrenci bazında ayrı ham puan girilir.
  - **Her soru farklı bir ÖÇ'ye ve dolayısıyla farklı bir PÇ'ye aktarılabilir.** Yani aynı sınavın Soru 1'i ÖÇ-1/PÇ-2'yi, Soru 2'si ÖÇ-3/PÇ-5'i ölçebilir. Eşleme **soru (kalem) düzeyinde** tanımlanır.
  - Toplam sınav notu, soru puanlarının toplamıdır; ancak ÖÇ/PÇ hesabı **soru düzeyindeki** eşlemelerden gelir (tek bir toplu sınav notundan değil).
- Her ölçme aracının/**sorusunun (kaleminin)** hangi program çıktısını, alt çıktısını veya ÖÇ'yi ölçtüğü
- Rubrikler
- Öğrenci bazlı puanlar
  - **Öğretim üyesi yalnızca ham not girer** (ör. soru/kalem bazında ham puan); manuel giriş **ve** Excel ile içe aktarma desteklenmelidir.
  - **Normalizasyon, ÖÇ ve PÇ hesapları tamamen ölçüm motoru tarafından yapılır** — kullanıcıdan normalize puan veya hesaplanmış skor beklenmez. (`refs/EE311-PO.xlsx`'teki "Normalized Grades", "Learning Outcomes", "Program Outcomes" sayfalarının karşılığı motor çıktısıdır, girdi değildir.)
  - Excel içe aktarma yalnızca **ham not sayfalarını** (ör. MT#1, MT#2, Final, ödev/ALE puanları ve öğrenci listesi) ve gerekli eşleme tanımlarını (kalem→ÖÇ ağırlıkları, ÖÇ→PÇ katkı matrisi) kabul eder; normalize/­hesaplanmış sayfalar göz ardı edilebilir.
  - İçe aktarımda öğrenci numarası maskeleme kuralı (ör. `134*****238`) korunmalı veya uygulanabilmelidir (bkz. Bölüm 13).
- Örnek öğrenci çalışmaları
- Çözümlü sınav/ödev örnekleri
- Notlandırma ve değerlendirme açıklaması
- Dönem sonu ders değerlendirme raporu
- İyileştirme önerileri

### Ders Dosyası Klasör Yapısı (`refs/doc-format.pdf` — Folder Format)

Her ders için, yüklenen belgeler aşağıdaki **numaralı klasör yapısına** otomatik yerleştirilmelidir (dosya adları Bölüm 6 formatında). Bu yapı, ders dosyasının kanıt iskeletidir ve Sanal Belge Odasına (Bölüm 5) bu biçimde taşınır:

1. **Ders İzlencesi** — `..._SYLLABUS_YYMMDD.PDF`
2. **Ders Devam Çizelgesi** — `..._ATTENDANCE_YYMMDD.PDF`
3. **Not Dağılım Çizelgesi** — `..._GRADES_YYMMDD.XLSX`
4. **Sınav Yoklama Listesi** — 4.1 Midterm-1, 4.2 Midterm-2, 4.3 Final, 4.4 Makeup … (`..._MIDTERM_EXAM_1_ATTENDANCE_…` vb.)
5. **Yarıyıl İçi Sınav Belgeleri** — 5.1 Midterm-1 (sınav / `_SOLUTIONS` / `_STUDENT_PAPERS`; **veya** çevrimiçi/bireysel için `Students` alt klasörü), 5.2 Midterm-2 …
6. **Yarıyıl Sonu Sınav Belgeleri** — Final (aynı alt yapı)
7. **Mazeret Sınavı Belgeleri** — Makeup (aynı alt yapı)
8. **Diğer Belgeler** — 8.1 Homework, 8.2 Quiz, 8.3 Project, 8.4 ALE, 8.5 Laboratory (8.5.x Prelab / Labquiz / Experiment), 8.6 Misc (Activity). Her biri: belge / `_SOLUTIONS` / `_STUDENT_PAPERS|REPORTS` veya bireysel için `Students` alt klasörü.
9. **Program ve Öğrenme Çıktıları** — `..._PROGRAM_AND_LEARNING_OUTCOMES_YYMMDD.XLSX`

- **Özel ders tipleri (8. Diğer Belgeler altında):** EE 399/499 → `TEF` (staj değerlendirme), `SPR` (staj raporu), `OP` (sözlü sunum); EE 491 → `IR1`, `IR2`, `TR`; EE 492 → `IR` (ara rapor), `FR` (final rapor), `PP` (poster sunumu, PPTX).

---

## 3. Program Çıktısı Ölçüm Motoru

Ölçüm motoru, kurumda hâlihazırda kullanılan ve `refs/EE311-PO.xlsx` ile `refs/EE492-PO.xlsx` dosyalarında örneklenen **iki aşamalı ağırlıklı toplama (rollup)** mantığını birebir yeniden üretmelidir. (EE 311 sınav/ödev temelli; EE 492 — Bitirme Projesi — ara rapor/final rapor/poster temellidir; motor her iki ölçme yapısını da desteklemelidir.) Detaylı formüller Ek-1'de verilmiştir. Motorun çalışma zinciri aşağıdaki gibidir:

1. **Ham puan girişi** — Ölçme aracı alt kalemleri (sınav soruları, ödev, ALE/etkin öğrenme etkinliği vb.) için öğrenci bazında ham puan girilir.
2. **Normalizasyon** — Her ölçme kalemi ortak bir ölçeğe normalize edilir. Örnek dosyada ölçek **0–5**'tir (ALE puanı /20, 25 puanlık sınav soruları /5). Normalizasyon ölçeği yapılandırılabilir olmalıdır (0–1, 0–5 veya 0–100).
3. **Kalem → ÖÇ toplaması** — Her ölçme kalemi bir veya birden çok ders öğrenme çıktısına (ÖÇ) eşlenir. Öğrenci bazında her ÖÇ skoru, kendisine eşlenen kalemlerin **kalem ağırlığı (%) ile ağırlıklı ortalamasıdır**.
4. **ÖÇ → PÇ toplaması** — Bölüm 1'deki katkı düzeyi matrisi kullanılarak, öğrenci bazında her PÇ skoru, ilgili ÖÇ skorlarının **katkı düzeyi ile ağırlıklı ortalamasıdır**. Katkı düzeyi 0 (Yok) olan ÖÇ'ler hesaba katılmaz.
5. **Toplulaştırma (öğrenci-merkezli)** — Ders bazlı PÇ skoru = o derste öğrencilerin PÇ skorlarının ortalaması. **Program düzeyi PÇ skoru öğrenci-merkezli hesaplanır** (detay ve formüller Ek-2): Bir öğrencinin tek bir PÇ-k değeri, o öğrencinin **aldığı tüm derslerdeki** PÇ-k katkılı ölçümlerin (müfredat haritasındaki ders katkı ağırlığıyla) birleşimidir → öğrenci başına **tek PÇ-k değeri**. Program PÇ-k = mezun olacak öğrencilerin bu bireysel değerlerinin toplulaştırması. Bu, MÜDEK'in "mezuniyet aşamasındaki öğrencinin PÇ'yi sağladığı" gereksinimine en uygun yöntemdir; **aynı öğrencinin dersler arası izlenmesini** (öğrenci-ders bağı / PÇ transkripti) gerektirir. Katkısı boş/0 olan ders/PÇ ölçülmemiş (NULL) sayılır ve paydadan düşer.

Sistem en az şu hesaplamaları yapmalıdır:

- Öğrenci bazlı ÖÇ ve PÇ başarı düzeyi
- Ders bazlı program çıktısı başarı düzeyi
- Dönem bazlı program çıktısı başarı düzeyi
- Program genelinde her MÜDEK çıktısı için başarı oranı (çok dersli toplulaştırma)
- Mezuniyet aşamasındaki öğrenciler için çıktı sağlama durumu
- Ölçme aracı / kalem bazlı katkı ağırlıkları (ağırlıklar toplamı %100 doğrulaması ile)
- Doğrudan ölçüm ve dolaylı ölçüm ayrımı (örnek dosya yalnızca doğrudan ölçüm içerir; dolaylı ölçüm için ayrı kaynak/ağırlık tanımlanabilmelidir)
- Rubrik bazlı değerlendirme (rubrik kriterleri ölçme kalemi olarak motora beslenebilmelidir)
- Eşik (başarı düzeyi) tanımı: PÇ skoru, tanımlı eşiğin (ör. 0–5 ölçeğinde 3.0 veya yüzde karşılığı %60) altındaysa **eşik altı** sayılır
- Eksik veri ve eksik kanıt analizi (puanı girilmemiş öğrenci/kalem, eşlenmemiş ÖÇ/PÇ tespiti)
- Eşik altı çıktılar için uyarı sistemi
- Her hesaplanan sayının izlenebilirliği: bir PÇ skorundan geriye doğru → katkı veren ÖÇ'ler → ölçme kalemleri → ham puanlar zinciri görüntülenebilmelidir

### Ölçme-Değerlendirme Modeli (MÜDEK uygulama modelleri)

MÜDEK uygulamasında yaygın üç ölçme-değerlendirme yaklaşımı vardır; sistem **yapılandırılabilir model seçimi** sunmalıdır:

- **Model 1 – Makro / öğrenci-bazlı (sınıf ortalaması):** PÇ skoru ders ortalaması üzerinden.
- **Model 2 – Grup-bazlı:** Öğrenci gruplarının başarı dağılımı üzerinden.
- **Model 3 – Mikro / kişisel ("MÜDEK Karnesi"):** Her öğrenci için ayrı ÖÇ/PÇ skoru; bireysel izlenebilirlik. **`refs/EE311-PO.xlsx`/`refs/EE492-PO.xlsx` ve bu promptun ölçüm motoru esas olarak Model 3'tür** ve gerektiğinde Model 1/2'ye toplulaştırılabilir.
- Eşik tanımı iki biçimde desteklenmelidir: (a) **skor eşiği** (ör. ortalama ≥ 3.0/5) ve (b) **oran eşiği** (ör. öğrencilerin ≥ %70'i belirlenen düzeyi sağladı). Hangisinin kullanılacağı yapılandırılabilir olmalıdır.

### Çok-Programlı (servis) Ders Ayrımı

Birden çok programın öğrencisinin aldığı ortak/servis derslerinde, her öğrenci **kendi programının** PÇ tanımları ve katkı matrisine göre değerlendirilebilmelidir (aynı ders, programa göre farklı PÇ eşlemesi).

### Veri Bütünlüğü ve Dönem Kapanışı

- Bir dönem **kapatıldığında** o döneme ait ham notlar ve hesaplanmış skorlar **kilitlenmeli** (salt-okunur); değişiklik ancak yetkili "yeniden açma" + audit kaydı ile mümkün olmalıdır.
- Hesaplamalar, o dönemde geçerli olan **matris ve eşik sürümleriyle** dondurulmalı; sonradan matris değişse bile geçmiş dönem sonuçları değişmemelidir (bkz. Bölüm 1, versiyonlama).

---

## 4. Sürekli İyileştirme Modülü

Sistem sadece ölçüm yapmamalı, ölçüm sonuçlarını iyileştirme döngüsüne bağlamalıdır.

Her iyileştirme kaydı için şunlar tutulmalıdır:

- İlgili MÜDEK ölçütü
- İlgili program çıktısı
- Problem veya gelişmeye açık alan
- Dayanak veri
- Alınan karar
- Sorumlu kişi/komisyon
- Planlanan eylem
- Hedef tarih
- Uygulama durumu
- Sonraki ölçüm sonucu
- Kapanış kanıtı
- Toplantı tutanağı veya karar belgesi bağlantısı
- **Önceki döngü bağlantısı:** Yeni bir iyileştirme döngüsü başlatıldığında, sistem aynı PÇ/ölçüt için önceki döngünün kararlarını ve sonraki ölçüm sonucunu otomatik olarak yüzeye çıkarmalıdır (kapanan döngü izlenebilirliği).

---

## 4A. Dolaylı Ölçüm, Anketler ve Program Eğitim Amaçları

Piyasadaki olgun akreditasyon araçlarında standart olan; bu promptta doğrudan ölçümü tamamlayan modüldür.

### Anket / Dolaylı Ölçüm Modülü

- Anket türleri: **ders-çıkış anketi**, **mezuniyet (senior exit) anketi**, **mezun anketi**, **işveren/paydaş anketi**, öğretim değerlendirme anketi.
- Her anket sorusu bir veya birden çok **PÇ veya Program Eğitim Amacı** ile eşlenebilmelidir.
- Anket sonuçları dolaylı ölçüm skoru olarak hesaplanır; PÇ başarı düzeyinde **doğrudan/dolaylı ağırlığı yapılandırılabilir** şekilde birleştirilir (ör. %70 doğrudan + %30 dolaylı).
- Dönemler/yıllar arası trend analizi sunulmalıdır.

### Program Eğitim Amaçları (Ölçüt 2)

- Program Eğitim Amaçları (PEA) ayrı bir varlık olarak tutulmalı; PÇ ile karıştırılmamalıdır (bkz. Bölüm 1).
- PEA değerlendirmesi **son 3–5 yıldaki mezunlar** üzerinden, ağırlıklı olarak **mezun ve işveren anketleriyle** yapılır; döngü PÇ döngüsünden farklıdır (daha uzun periyot).
- Paydaş katılımıyla PEA gözden geçirme kayıtları (toplantı tutanağı, revizyon geçmişi) tutulmalıdır.

---

## 5. Sanal Belge Odası Uyumu

Uygulama, MÜDEK **Sanal Belge Odaları Hazırlama Yönergesi** (`refs/sanal-belge-odasi.pdf`) ile uyumlu bir belge/dizin yapısı üretmelidir. Üretilen dizin ağacı, dosya adlandırması ve İçindekiler dosyaları bu yönergeye birebir uymalıdır.

İki yapı desteklenmelidir:

- **FBO – Fakülte Belge Odası**
- **BBO – Bölüm Belge Odası** (değerlendirilen her program için ayrı bir BBO dizini)

> **Kritik kural — dizin/dosya adları:** Tüm dizin ve dosya adları **Türkçe karakter içermemelidir** (ör. `Ogrenciler`, `Surekli Iyilestirme`, `Kanit`). Numara önekleri korunmalıdır. Yüklenen dosyalar (dışa aktarma ZIP'i hariç) **zip/rar ile sıkıştırılmamış** olmalıdır.

### FBO – Fakülte Belge Odası Yapısı

Ana dizin `FakulteAdi/` altında:

- `1 - Fakulte Kanit Belgeleri`
- `2 - Ziyaret Oncesi Istenilen Ek Bilgiler ve Belgeler`
- `3 - Ziyaret Sirasinda Ek Olarak Sunulan Bilgiler ve Belgeler`

`1 - Fakulte Kanit Belgeleri` altındaki alt dizinler:

- `1- Ortak Yabanci Dil Dersleri`
- `2- Ortak Fizik Dersleri`
- `3- Ortak Kimya Dersleri`
- `4- Ortak Matematik Dersleri`
- `5- Ortak Bilisim Dersleri`
- `6- Ortak Sosyal ve Spor Alanlari`
- `7- Fakulte ve Universite Kapsaminda Engelliler icin Alinmis Olan Onlemler`
- `8- Fakulte ve Universite Kapsaminda Alinmis Olan Guvenlik Onlemleri`
- `9- Universite Kutuphane Olanaklari`
- `10- Universite Bilisim Olanaklari`
- `11- Universite Saglik Olanaklari`
- `12- Diger`

### BBO – Bölüm Belge Odası Yapısı

Ana dizin `ProgramAdi/` altında:

- `1 - Program Kanit Belgeleri`
- `2 - Ziyaret Oncesi Istenilen Ek Bilgiler ve Belgeler`
- `3 - Ziyaret Sirasinda Ek Olarak Sunulan Bilgiler ve Belgeler`
- `4 - 30-Gun Yaniti Belgeleri`

`1 - Program Kanit Belgeleri` altındaki ölçüt dizinleri:

- `0- Ortak Derslerdeki Farkliliklar`
- `1- Ogrenciler`
- `2 - Program Egitim Amaclari`
- `3 - Program Ciktilari`
- `4 - Surekli Iyilestirme`
- `5 - Egitim Plani`
- `6 - Ogretim Kadrosu`
- `7 - Altyapi`
- `8 - Kurum Destegi ve Parasal Kaynaklar`
- `9 - Organizasyon ve Karar Alma Surecleri`

`3 - Program Ciktilari` altında **MÇ-1'den MÇ-11'e kadar** alt dizinler otomatik oluşturulmalıdır (her MÇ için ilgili kanıtlar bileşen bazında değerlendirme sonuçlarıyla birlikte). Gerekli durumlarda ilgili ölçüt altında **alt ölçüt numarasıyla** alt dizin (ör. `Olcut 3.2`, `Olcut 3.3`) oluşturulabilmelidir.

> **Not (yerleştirme kuralı):** "Atatürk İlkeleri ve İnkılap Tarihi", "Türkçe", "Yabancı Dil", "Fizik", "Kimya", "Matematik", "Bilişim" derslerine ait MÇ kanıtları, ortak olarak verilseler bile, ilgili programın BBO'sundaki ilgili MÇ dizininde yer almalıdır.

---

## 6. Dosya Yükleme ve Kontrol

Sistem dosya yüklenirken şu kontrolleri yapmalıdır:

Tüm kurallar `refs/sanal-belge-odasi.pdf` (Madde 3.1) ve kurumsal dosya formatı `refs/doc-format.pdf` ile uyumlu olmalıdır:

- **İzin verilen dosya türleri:** yazılı belgeler için **PDF**, fotoğraflar için **JPEG veya TIFF**, videolar için **MP4 veya AVI**.
- **Dosya boyutu sınırları:** PDF ve fotoğraflar için **≤ 5 MB**, videolar için **≤ 30 MB**. Sınır aşımında uyarı ve ayrıntı kaybetmeden minimum çözünürlük önerisi.
- **Sıkıştırma yasağı:** Yüklenen dosyalar zorunlu olmadıkça zip/rar ile sıkıştırılmamalıdır (yalnızca nihai dışa aktarma paketi ZIP olabilir).
- **Türkçe karakter içermeyen dosya/dizin adı** zorunluluğu ve otomatik normalizasyon önerisi.
- **Otomatik dosya adı üretimi (kurumsal format — `refs/doc-format.pdf`):** Öğretim üyesi bir belge yüklediğinde dosya adı **otomatik** bu şablona göre üretilmelidir (tarih biçimi `YYMMDD`; bu MÜDEK yönergesindeki `YYAAGG` ile aynıdır):
  - **Öğrenci belgeleri:** `[Ders Kodu]_[Şube Kodu]_[Dönem Bilgisi]_[Etkinlik Adı]_[Öğrenci ad(lar)ı baş harfi].[Soyad(lar)ı]_[YYMMDD].PDF`
    ör. `EE201_02_S2122_HOMEWORK_1_A.CALISKAN_231015.PDF` (bireysel), `EE201_01_S2122_HOMEWORK_1_A.CALISKAN_B.GUCLU_C.BASAR_231015.PDF` (grup)
  - **Ders belgeleri:** `[Ders Kodu]_[Şube Kodu]_[Dönem Bilgisi]_[Belge Türü]_[YYMMDD].PDF`
    ör. `EE201_01_S2122_HOMEWORK_1_231015.PDF`, `EE201_02_S2324_SYLLABUS_231015.PDF`
  - **Dönem Bilgisi kodlaması:** `S`=Bahar (Spring), `F`=Güz (Fall), `Su`=Yaz (Summer) + akademik yıl (ör. `2122` = 2021-2022). Örnek: `S2122`.
  - **Belge türü sözlüğü (örnekler):** `HOMEWORK`, `QUIZ`, `PROJECT`, `ALE`, `LAB`, `PRELAB`, `LABQUIZ`, `MIDTERM_EXAM`/`MIDTERM_EXAM_1`, `FINAL_EXAM`, `MAKEUP_EXAM`, `SYLLABUS`, `ATTENDANCE`, `MIDTERM_EXAM_ATTENDANCE`/`FINAL_EXAM_ATTENDANCE`, `GRADES`, `PROGRAM_AND_LEARNING_OUTCOMES`; bitirme/staj: `TEF`, `SPR`, `OP` (EE 399/499), `IR1`/`IR2`/`TR` (EE 491), `IR`/`FR`/`PP` (EE 492).
  - **Ek son ekler:** `_SOLUTIONS` (çözüm), `_STUDENT_PAPERS` / `_STUDENT_REPORTS` (birleştirilmiş-taranmış öğrenci çalışmaları), `_MANUAL` (lab föyü).
  - **Dosya türü kuralı (belge türüne göre):** varsayılan **PDF**; `GRADES` ve `PROGRAM_AND_LEARNING_OUTCOMES` → **XLSX (zorunlu Excel)**; `ATTENDANCE` → PDF veya XLSX; sunumlar (`OP`, `PP`) → **PPTX**. **DOCX kabul edilmez** (PDF'e çevrilir).
- Aynı belgenin yeni sürümü yüklendiğinde **eski sürüm silinmeden**, yeni sürüm yeni yükleme tarihli yeni adıyla saklanır (versiyon takibi).
- Her ana dizin ve alt dizin için, dizin-dosya yapısını ve son değişiklik tarihini yansıtan otomatik **“İçindekiler”** dosyası üretimi.
- Eksik belge kontrolü (ölçüt/MÇ bazında beklenen-yüklenen karşılaştırması).
- Kanıtın hangi ölçüt, MÇ/çıktı, ders, ölçme aracı ve öğrenci grubuyla ilişkili olduğunu gösteren metadata.
- Çok sekmeli/çok satırlı bir veri kümesinin MS Excel olarak sunulması gerekirse, bunun değerlendirici onayı gerektirdiği notu.

---

## 7. Kullanıcı Rolleri

Şu roller tanımlanmalıdır:

- Sistem yöneticisi
- Dekanlık/fakülte kalite sorumlusu
- Bölüm başkanı
- Program MÜDEK koordinatörü
- Öğretim üyesi
- Ders sorumlusu
- Akademik danışman (kendi danışmanlığındaki öğrencilerin PÇ sağlama durumunu izleyebilen)
- Komisyon üyesi
- Değerlendirici/okuma modu kullanıcısı

Her rol için yetkiler ayrıntılı tanımlanmalıdır.

---

## 8. Dashboard

Uygulama şu ekranları içermelidir:

- Program genel durum paneli
- Ders dosyası tamamlama paneli
- MÜDEK çıktısı başarı paneli
- Eksik kanıt paneli
- Sürekli iyileştirme takip paneli
- Öğretim üyesi görev listesi
- Ziyaret öncesi hazırlık paneli
- BBO/FBO dışa aktarma paneli

---

## 9. Raporlama

Sistem şu raporları üretmelidir:

- Program çıktısı ölçüm raporu
- Ders bazlı çıktı katkı raporu
- Öğrenci bazlı çıktı sağlama raporu
- Ölçüt bazlı kanıt listesi
- Eksik kanıt raporu
- Sürekli iyileştirme raporu
- MÜDEK ziyaret hazırlık raporu
- Sanal Belge Odası içindekiler raporu
- Excel ve PDF çıktıları

---

## 10. Veri Modeli

Önerilecek veri modeli şu varlıkları içermelidir:

- Institution
- Faculty
- Department
- Program
- AcademicYear
- Semester
- Course
- CourseOffering
- Instructor
- Student
- ProgramOutcome
- OutcomeComponent
- CourseLearningOutcome
- CLOProgramOutcomeMapping (ÖÇ→PÇ katkı düzeyi matrisi; değer: 0 / 0.25 / 0.5 / 0.75 / 1)
- CourseProgramOutcomeMatrix (program müfredat haritası: Ders→PÇ katkı ağırlığı; bkz. `refs/course-po-matrix.md`)
- Assessment
- AssessmentItem
- AssessmentItemCLOMapping (ölçme kalemi→ÖÇ eşlemesi ve kalem ağırlığı %)
- Rubric
- RubricCriterion
- StudentScore
- OutcomeAttainment (öğrenci/ders/program/dönem bazlı hesaplanmış ÖÇ ve PÇ skorları + eşik durumu)
- EvidenceFile
- EvidenceMapping
- ImprovementAction
- MeetingDecision
- VirtualDocumentRoom
- Folder
- ExportPackage
- User
- Role
- Permission
- AuditLog

---

## 11. Teknoloji Önerisi

Modern, sürdürülebilir ve kurum içinde kurulabilir bir mimari öner.

Tercihen:

- **Frontend:** Next.js (React)
- **Database / Backend:** **Supabase** (yönetilen PostgreSQL üzerinde). Supabase'in şu bileşenleri kullanılmalıdır:
  - **Postgres + Row Level Security (RLS):** Bölüm 7'deki rol/yetki matrisi (ders/program/fakülte bazlı sınırlar, değerlendirici salt-okunur erişim) RLS politikalarıyla uygulanmalıdır.
  - **Supabase Auth:** Kurum hesabı/SSO (SAML/OIDC) ile entegrasyon.
  - **Supabase Storage:** Kanıt dosyaları (PDF/JPEG/TIFF/MP4/AVI) için; boyut sınırları ve dosya türü kısıtları depolama politikalarıyla zorlanmalıdır.
  - Sunucu tarafı iş mantığı (ölçüm motoru, dışa aktarma) için **Edge Functions** veya ayrı bir API katmanı (ör. NestJS/FastAPI) tercih edilebilir; tercih gerekçesiyle belirtilmelidir.
- **Export:** PDF, XLSX ve ZIP klasör çıktısı (Sanal Belge Odası paketi).
- **Audit log:** Tüm kritik işlemler için kayıt (Postgres tablosu; mümkünse veritabanı tetikleyicileri ile).
- Kurum içi kurulum gereği varsa, Supabase'in **self-hosted** seçeneği değerlendirilmeli ve veri konumu (Türkiye/AB) KVKK açısından netleştirilmelidir (bkz. Bölüm 13).
- **OBS/SIS entegrasyonu (yol haritası):** Türkiye pazarındaki rakiplerin (GEOMES/AkreditasyonSistemi, Proliz OBS modülü) en güçlü ayırt edici özelliği, açılan dersler / öğrenci listeleri / dönem notlarının **OBS'den otomatik çekilmesi** ve her dönem yeniden veri girişi gerektirmemesidir. Mimari, ileride OBS/ÜBYS (Proliz, UNİPA vb.) ve LMS entegrasyonuna izin verecek bir **içe aktarma adaptör katmanı** ile tasarlanmalıdır. MVP'de bu köprü, Bölüm 2'deki **Excel içe aktarma** ile sağlanır; öğretim üyesi yükünü en aza indirme prensibi (Bölüm 12) bu yol haritasıyla desteklenir.

---

## 12. Kritik Prensipler

- Uygulama sadece dosya deposu olmamalıdır; ölçme, değerlendirme, kanıt ve iyileştirme arasında izlenebilirlik sağlamalıdır.
- Her sayı bir kanıta bağlanmalıdır.
- Her kanıt bir ders, ölçme aracı, çıktı ve ölçüt ile ilişkilendirilebilmelidir.
- Sistem öğretim üyesine minimum ek yük getirmelidir.
- Değerlendiriciye açık, düzenli, indirilebilir ve kanıtlanabilir bir yapı sunmalıdır.
- MÜDEK uyumlu görünmelidir ama resmi MÜDEK sistemi olduğu izlenimi vermemelidir.
- **Arayüz dili Türkçe olmalıdır.** Tüm ekranlar, menüler, raporlar, hata/uyarı mesajları ve üretilen belge/İçindekiler çıktıları Türkçe olmalıdır. (İleride çok dillilik için altyapı i18n uyumlu tasarlanabilir, ancak MVP yalnızca Türkçe sunmalıdır.) Not: Sanal Belge Odası **dizin ve dosya adları** Türkçe karakter içermemelidir (bkz. Bölüm 5–6); bu, içerik dilinden bağımsız teknik bir adlandırma kuralıdır.

---

## Beklenen Çıktılar

Lütfen bana şu çıktıları üret:

### A. Ürün Vizyonu ve Kapsam Tanımı

- Ürünün temel amacı
- Hedef kullanıcılar
- Temel problem (özellikle: Excel/Model 3 tabanlı bireysel ölçmenin büyük bölümlerde sürdürülemezliği — ÖDR'lerde belgelenmiş bir kurumsal ihtiyaçtır)
- Çözüm yaklaşımı
- MÜDEK/ABET benzeri süreçler açısından ürünün konumlandırılması
- **Rakip/pazar konumlandırması:** Türkiye'de mevcut çözümler (GEOMES AkreditasyonSistemi.com, Proliz OBS akreditasyon modülü, üniversitelerin kendi OBS/ÜBYS modülleri) ve uluslararası araçlar (Watermark, AEFIS/HelioCampus, EvalTools, Anthology) karşısında ürünün farklılaşması; özellikle otomatik Sanal Belge Odası üretimi, kanıt↔ölçüm izlenebilirliği ve OBS'ye bağımlı olmadan (Excel köprüsüyle) hızlı devreye alınabilme açısından konumlandırma.

### B. MVP İçin Gerekli Modüller

- İlk sürümde mutlaka bulunması gereken modüller
- Her modülün amacı
- Her modülün minimum işlev seti
- Modüller arası veri akışı

### C. MVP Dışında Bırakılması Gereken Özellikler

- İlk sürümde yapılmaması gereken özellikler
- Bu özelliklerin neden ertelenmesi gerektiği
- İkinci veya üçüncü faza bırakılabilecek kapsam

### D. Kullanıcı Rolleri ve Yetki Matrisi

- Her rolün yapabileceği işlemler
- Okuma/yazma/silme/onaylama yetkileri
- Ders bazlı, program bazlı ve fakülte bazlı yetki sınırları
- Değerlendirici için salt-okunur erişim modeli

### E. Veritabanı Şeması Önerisi

- Ana tablolar
- İlişkiler
- Birincil ve yabancı anahtarlar
- Çoktan çoğa ilişkiler
- Versiyonlama ve audit log için gerekli alanlar
- Dosya metadata modeli

### F. Temel Ekran Listesi

- Ekran adı
- Kullanıcı amacı
- Giriş verileri
- Gösterilecek bilgiler
- Temel kullanıcı aksiyonları

### G. Program Çıktısı Ölçüm Algoritması

- Öğrenci bazlı hesaplama
- Ders bazlı hesaplama
- Program bazlı hesaplama
- Ölçme aracı ağırlıkları
- Doğrudan/dolaylı ölçüm ayrımı
- Rubrik bazlı ölçüm
- Eşik altı uyarı üretimi
- Eksik veri durumunda davranış

#### G.1. Referans Mimari (Önerilen)

Motor, `refs/EE311-PO.xlsx` ve `refs/EE492-PO.xlsx` mantığını korur ancak aşağıdaki ilkelerle yeniden kurulur (gerekçeler Ek-3'te).

**İlkeler**

1. **Saf, deterministik fonksiyon:** `sonuç = f(ham_notlar, eşlemeler, konfig)`. Yan etki yok; aynı girdi her zaman aynı çıktıyı verir; istendiğinde yeniden hesaplanabilir.
2. **Versiyonlu girdi, dondurulmuş çıktı:** Katkı matrisi/eşik değişse bile geçmiş dönem sonuçları, o dönemde geçerli **matris sürümüyle** sabit kalır.
3. **"Ölçülmedi" ≠ "0 aldı":** Üç durum ayrı tutulur — `ölçüldü(değer)`, `ölçülmedi(NULL → ortalamadan dışlanır)`, `0 puan(gerçek sıfır, hesaba girer)`. `IFERROR→0` ve `AVERAGEIF<>0` davranışı kullanılmaz.

**Konumlandırma:** Hesap, küme-temelli ve katmanlı olduğundan **PostgreSQL (Supabase) içinde** yapılır — canlı katmanlar `VIEW`, dönem kapanışında `MATERIALIZED` snapshot. Sayılar tek bir doğruluk kaynağında (DB) üretilir; ağır rapor/ZIP I/O'su Edge Function'da. Excel/JS'te ikinci bir hesap implementasyonu yapılmaz.

**Hesap zinciri (saf adımlar)**

1. **Normalizasyon:** `norm = raw / max_score * ölçek` (NULL → NULL, sıfıra çevrilmez).
2. **Kalem → ÖÇ (öğrenci):** ölçülen kalemlerin kalem-ağırlıklı ortalaması; NULL'lar paydadan da düşer:
   `LO(j,s) = Σ wᵢ·normᵢ (normᵢ≠NULL) / NULLIF(Σ wᵢ (normᵢ≠NULL), 0)`
3. **ÖÇ → PÇ (öğrenci):** katkı düzeyi ağırlıklı ortalama; `düzey=0` ve ölçülmemiş ÖÇ dışlanır:
   `PO(k,s) = Σ c(j,k)·LO(j,s) / Σ c(j,k)`
4. **Ders bazlı PÇ:** öğrenci PÇ skorlarının ortalaması.
5. **Program bazlı PÇ:** müfredat haritası ağırlıklı toplulaştırma (Ek-2).

**Eşik/yargı (referans Excel'lerde eksik olan):** Her PÇ için iki eşik biçimi desteklenir — (a) **skor eşiği** (ör. ortalama ≥ 3.0/5), (b) **oran eşiği** (ör. öğrencilerin ≥ %70'i eşik düzeyini sağladı). Yalnızca ortalama değil, **dağılım** (eşik altı öğrenci oranı) da raporlanır.

**Doğrudan + dolaylı birleştirme:** Doğrudan ölçüm sonucu, dolaylı ölçüm (anket, Bölüm 4A) ile yapılandırılabilir ağırlıkla birleştirilebilir (ör. %70/%30); kaynaklar ayrı ayrı da görüntülenebilir kalır.

**İzlenebilirlik:** Her snapshot satırı bir üst katmana kaynak referansıyla bağlıdır; PÇ skoru → ÖÇ'ler → kalemler → ham not zinciri arayüzde gezilebilir.

**Doğrulama (golden test):** `refs/EE311-PO.xlsx` ve `refs/EE492-PO.xlsx` altın referans alınır; aynı ham notlarla motor çıktısı, Excel ile (NULL→0 uyumluluk modunda) ondalık hassasiyette eşleşmelidir. Ardından NULL/eşik iyileştirmeleri açılıp fark bilinçli olarak gösterilir.

### H. Ders Dosyası Yükleme İş Akışı

- Öğretim üyesinin sisteme girişinden dosya yüklemeye kadar adımlar
- Dosya türü ve adlandırma kontrolleri
- Kanıt metadata eşlemesi
- Versiyonlama
- Eksik kanıt uyarıları
- Ders dosyası tamamlanma durumu

### I. Sürekli İyileştirme İş Akışı

- Ölçüm sonucundan iyileştirme aksiyonuna geçiş
- Karar kaydı oluşturma
- Sorumlu atama
- Aksiyon takibi
- Sonraki dönem ölçüm sonucu ile kapatma
- Kanıt ve toplantı tutanağı ilişkilendirme

### J. Sanal Belge Odası Dışa Aktarma Mantığı

- FBO ve BBO klasör yapısı (Bölüm 5'teki resmi dizin ağacına birebir uygun, numara önekleri korunarak)
- Ölçüt bazlı dosya yerleşimi (BBO `1 - Program Kanit Belgeleri` altındaki 0–9 ölçüt dizinleri; gerektiğinde alt ölçüt dizinleri)
- MÇ-1'den MÇ-11'e kadar kanıt yerleşimi (`3 - Program Ciktilari` altında)
- Her dizin/alt dizin için otomatik İçindekiler dosyası (son değişiklik tarihiyle)
- ZIP çıktısı (içerideki dosyalar ayrıca sıkıştırılmadan)
- Dosya adı normalizasyonu (Türkçe karakter temizliği + yönergedeki adlandırma şablonları, `YYAAGG`)
- Dosya türü/boyut doğrulaması (PDF & foto ≤5 MB, video ≤30 MB)
- Eksik belge raporu (ölçüt/MÇ bazında beklenen-yüklenen farkı)
- Doğrulama: dizin/dosya adlarında Türkçe karakter olmaması ve izinli uzantılar dışında dosya bulunmaması

### K. API Endpoint Taslağı

- Kimlik doğrulama endpointleri
- Program/ders yönetimi endpointleri
- Çıktı yönetimi endpointleri
- Ölçme aracı endpointleri
- Öğrenci puanı endpointleri
- Kanıt dosyası endpointleri
- Raporlama endpointleri
- Sanal Belge Odası export endpointleri
- Audit log endpointleri

### L. Örnek Kullanıcı Hikayeleri

- Program koordinatörü olarak
- Öğretim üyesi olarak
- Bölüm başkanı olarak
- Fakülte kalite sorumlusu olarak
- Değerlendirici olarak

Her kullanıcı hikayesi için:

- Amaç
- Kabul kriterleri
- İlgili ekran/modül

### M. Teknik Riskler ve Azaltma Stratejileri

- Veri kalitesi riski
- Öğretim üyesi kullanım direnci
- Dosya karmaşası riski
- Yanlış ölçüm algoritması riski
- Yetkilendirme riski
- Büyük dosya yönetimi riski
- Kurumsal entegrasyon riski
- MÜDEK yönerge değişikliği riski

### N. İlk 8 Haftalık Geliştirme Planı

Her hafta için:

- Hedef
- Geliştirilecek modüller
- Beklenen çıktı
- Test/kabul kriteri

### O. Kabul Kriterleri

MVP’nin tamamlanmış sayılması için:

- Fonksiyonel kabul kriterleri
- Veri doğruluğu kriterleri
- Raporlama kriterleri
- Dışa aktarma kriterleri
- Güvenlik ve yetkilendirme kriterleri
- Kullanılabilirlik kriterleri

### P. Daha Sonra Geliştirilebilecek İleri Özellikler

- Yapay zekâ destekli belge sınıflandırma
- Syllabus’tan otomatik çıktı eşleme
- Rubrik önerme
- Eksik kanıt için akıllı öneriler ve YZ destekli iyileştirme aksiyonu önerisi
- **OBS/ÜBYS entegrasyonu** (Proliz, UNİPA vb.) — ders/öğrenci/not otomatik aktarımı (MVP'deki Excel köprüsünün yerini alır; bkz. Bölüm 11)
- LMS entegrasyonu (Canvas/Moodle/Blackboard — not ve rubrik aktarımı)
- Google Drive / OneDrive entegrasyonu (Sanal Belge Odası doğrudan buluta üretim)
- Çok programlı fakülte akreditasyon yönetimi
- ABET ve EUR-ACE uyumluluk modu (çıktı seti ve rapor formatı değiştirilebilir)
- Değerlendirici okuma portalı (salt-okunur, ziyaret öncesi erişim)
- Otomatik ÖDR (Öz Değerlendirme Raporu) destek raporu üretimi — ölçüt bazlı anlatı taslağı + kanıt yerleştirme
- Dönem notlarından öğrenci PÇ karnesi (bireysel "MÜDEK Karnesi") üretimi ve danışman paylaşımı

---

## 13. Kişisel Veri ve KVKK

Sistem öğrenci kimlik bilgisi ve akademik performans verisi (kişisel veri) işlediğinden, KVKK gereklilikleri MVP'den itibaren dikkate alınmalıdır:

- **Öğrenci numarası maskeleme:** Dışa aktarılan kanıt ve raporlarda öğrenci numarası maskelenebilmelidir (ör. `134*****238`); örnek hesaplama dosyaları `refs/EE311-PO.xlsx` ve `refs/EE492-PO.xlsx` bu maskeleme yaklaşımını kullanır.
- **Asgari veri / amaçla sınırlılık:** Yalnızca ölçüm ve akreditasyon kanıtı için gerekli alanlar tutulmalıdır.
- **Erişim kısıtı:** Öğrenci bazlı ham veriye erişim rol bazlı (RLS) sınırlanmalı; değerlendirici erişimi salt-okunur ve gerektiğinde maskelenmiş olmalıdır.
- **Saklama ve silme:** Saklama süresi ve silme/anonimleştirme politikası tanımlanabilmelidir.
- **Veri konumu:** Bulut kullanılıyorsa veri konumu (Türkiye/AB) ve gerekiyorsa self-hosted seçeneği netleştirilmelidir (bkz. Bölüm 11).
- **İzlenebilirlik:** Kişisel veriye erişim ve dışa aktarma işlemleri audit log'a kaydedilmelidir.

---

## 14. Referans Dosyalar

Bu prompttaki gereksinimler aşağıdaki kurumsal referanslarla uyumlu olmalıdır:

| Dosya | İçerik | İlgili Bölümler |
|---|---|---|
| `refs/degerlendirme-olcutleri.pdf` | MÜDEK Mühendislik Lisans Programları Değerlendirme Ölçütleri (Sürüm 3.1) — 9 ölçüt, 11 MÇ ve tanımlar | 1, 3, 5 |
| `refs/sanal-belge-odasi.pdf` | MÜDEK Sanal Belge Odaları Hazırlama Yönergesi (Sürüm 2.x) — FBO/BBO dizin yapısı, dosya adlandırma, format/boyut kuralları | 5, 6, J |
| `refs/doc-format.pdf` | Kurumsal dosya adlandırma formatı + ders dosyası klasör yapısı (Ders Kodu_Şube_Dönem_Tür_YYMMDD; belge türü sözlüğü; dosya tipi kuralları) | 2, 6, J |
| `refs/EE311-PO.xlsx` | Ders bazlı ÖÇ/PÇ ölçüm motoru — EE 311 (sınav/ödev temelli) | 3, G, Ek-1 |
| `refs/EE492-PO.xlsx` | Ders bazlı ÖÇ/PÇ ölçüm motoru — EE 492 Bitirme Projesi (rapor/poster temelli) | 3, G, Ek-1 |
| `refs/course-po-matrix.md` | Program müfredat haritası (Ders × PÇ katkı matrisi) | 3, G, Ek-2 |

---

## Ek-1: Ölçüm Motoru Formülleri (`refs/EE311-PO.xlsx` / `refs/EE492-PO.xlsx` mantığı)

Notasyon: öğrenci `s`, ölçme kalemi `i`, öğrenme çıktısı `j` (ÖÇ), program çıktısı `k` (PÇ). Tüm skorlar 0–5 ölçeğinde (ölçek yapılandırılabilir).

1. **Normalizasyon:** `norm(i,s) = ham(i,s) / ölçek_böleni(i)` (ör. ALE puanı /20; 25'lik sınav sorusu /5).
2. **ÖÇ skoru (öğrenci):**
   `LO(j,s) = Σ_i [ w_i · norm(i,s) · m(i,j) ] / Σ_i [ w_i · m(i,j) ]`
   burada `w_i` = kalem ağırlığı (%), `m(i,j)` = kalem `i`'nin ÖÇ `j`'ye eşlenip eşlenmediği (1/0).
3. **PÇ skoru (öğrenci):**
   `PO(k,s) = Σ_j [ c(j,k) · LO(j,s) ] / Σ_j c(j,k)`
   burada `c(j,k)` = ÖÇ→PÇ katkı düzeyi (0 / 0.25 / 0.5 / 0.75 / 1). `c(j,k)=0` olan ÖÇ'ler dışlanır.
4. **Ders bazlı PÇ:** `PO_ders(k) = ortalama_s PO(k,s)`.
5. **Eşik:** `PO_ders(k) < eşik` ise eşik altı uyarısı (varsayılan eşik ör. 0–5'te 3.0 / %60).
6. **Eksik veri:** Puanı girilmemiş kalem veya eşlenmemiş ÖÇ/PÇ "eksik kanıt" olarak işaretlenir; hesaplamada `IFERROR→0` yerine **"hesaplanamadı"** durumu ayrı tutulmalıdır (sıfır ile karıştırılmamalı).

---

## Ek-2: Program Düzeyi Toplulaştırma (Öğrenci-merkezli)

Program müfredat haritasında her ders `d`'nin her PÇ `k`'ye katkı ağırlığı `a(d,k)` (1 / 0.75 / 0.5 / 0.25 / boş) tanımlıdır (`refs/course-po-matrix.md`). `PO_ders(d,k,s)` = öğrenci `s`'nin `d` dersindeki PÇ-k skoru (Ek-1, adım 3).

Önce her öğrenci için, aldığı tüm dersler boyunca **tek** bir PÇ-k değeri hesaplanır:

`PO_ogrenci(k,s) = Σ_d [ a(d,k) · PO_ders(d,k,s) ] / Σ_d a(d,k)`
(yalnızca öğrenci `s`'nin aldığı **ve** `a(d,k)` tanımlı dersler; ölçülmemiş ders/PÇ NULL → paydadan da düşer.)

Sonra program düzeyi:
`PO_program(k) = toplulaştır_s PO_ogrenci(k,s)` (ortalama **veya** oran eşiği: öğrencilerin %X'i ≥ eşik).

- **Veri gereksinimi:** Aynı öğrencinin dersler arası bağı (öğrenci-ders kayıt geçmişi). Mezuniyet aşaması için **mezun olacak kohort** süzülür.
- Eşik altı PÇ'ler ve katkı veren ders sayısı düşük (zayıf kapsanan) PÇ'ler ayrıca raporlanmalıdır.

---

## Ek-3: Referans Excel Mantığının (EE311/EE492) MÜDEK Açısından Değerlendirmesi

`refs/EE311-PO.xlsx` / `refs/EE492-PO.xlsx` modeli, Türkiye'de yaygın kullanılan, savunulabilir bir yaklaşımdır (esasen Model 3 / "MÜDEK Karnesi"). MÜDEK belirli bir hesaplama formülü **dayatmaz** (Ölçüt 3.2: çıktıların niteliğine uygun, sistematik, kanıta dayalı süreç). Bu nedenle model korunur; ancak G.1 referans mimarisi aşağıdaki bilinen zaafları kapatır:

| # | Zaaf | Etki | Referans mimaride çözüm |
|---|---|---|---|
| 1 | Yalnızca doğrudan ölçüm | MÜDEK doğrudan + dolaylı bekler | Anket/dolaylı ölçüm birleştirme (Bölüm 4A, G.1) |
| 2 | Eşik/hedef yargısı yok; yalnızca ortalama | Sınıf ortalaması başarısız dağılımı gizler | Skor **ve** oran eşiği; eşik altı öğrenci oranı raporu |
| 3 | Tek ders kapsamı | Tek ders ≠ mezuniyet aşaması program başarısı | Müfredat haritasıyla program düzeyine toplulaştırma (Ek-2) |
| 4 | Katkı düzeyini (ilgililik) erişim ağırlığı olarak kullanma | İlgililik ile erişim harmanlanır | Model korunur; ayrıca kanıtı doğrudan PÇ/performans göstergesine bağlama seçeneği sunulur |
| 5 | `IFERROR→0` ve `AVERAGEIF<>0` | "Ölçülmedi" ile "0 aldı" karışır; skor şişer/sönükleşir | NULL semantiği: üç durum ayrı (G.1, İlke 3) |

**Sonuç:** Mevcut motor "yanlış" değildir ve golden-test referansı olarak kullanılır; referans mimari onu MÜDEK'in beklediği hedef-bazlı yargı, dolaylı ölçüm ve program düzeyi sağlama ile tamamlar.

---

## Ek Talimat

Yanıtı yapılandırılmış, uygulanabilir ve yazılım geliştirme ekibine doğrudan aktarılabilir şekilde hazırla. Gerektiğinde tablolar kullan. Varsayımları açıkça belirt. Tüm gereksinimler `refs/` altındaki dört referans dosyayla tutarlı olmalıdır. MÜDEK’e resmi bağlılık iddiası oluşturacak ifadelerden kaçın. Uygulamayı “MÜDEK uyumlu belge ve ölçüm yönetimi aracı” olarak konumlandır. Arayüz ve çıktı dili Türkçe olmalıdır.
