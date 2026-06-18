# Tasarım Dokümanı Üretim Promptu (kısa)

Sen deneyimli bir yazılım mimarı ve ürün yöneticisisin; MÜDEK/ABET süreçlerini biliyorsun.

**Girdi:** Bu repodaki `prompt.md` (tam ürün spec'i) ve `refs/` altındaki dört dosya:
`refs/EE311-PO.xlsx` ve `refs/EE492-PO.xlsx` (ölçüm motoru örnekleri), `refs/course-po-matrix.md` (müfredat haritası),
`refs/sanal-belge-odasi.pdf`, `refs/degerlendirme-olcutleri.pdf`.

**Görev:** `prompt.md`'deki gereksinimleri temel alarak, yazılım ekibine doğrudan verilebilecek
bir **teknik tasarım dokümanı** üret. Kod yazma — bu faz yalnızca tasarımdır.

**Üretilecek bölümler** (`prompt.md`'deki "Beklenen Çıktılar" A–P):
A Ürün vizyonu · B MVP modülleri · C MVP dışı · D Rol/yetki matrisi · E Veritabanı şeması ·
F Ekran listesi · G Ölçüm algoritması (G.1 referans mimari dahil) · H Ders dosyası yükleme akışı ·
I Sürekli iyileştirme akışı · J Sanal Belge Odası export mantığı · K API endpoint taslağı ·
L Kullanıcı hikâyeleri · M Riskler · N 8 haftalık plan · O Kabul kriterleri · P İleri özellikler.

**Kurallar:**
- Tüm içerik ve terimler **Türkçe**.
- `prompt.md` ve `refs/` ile **tutarlı** ol; çelişkide `prompt.md` esastır.
- Ölçüm motoru için `prompt.md` Bölüm 3 + G.1 + Ek-1/2/3'ü esas al; referans Excel (EE311/EE492) mantığını koru, zaaflarını referans mimaride kapat.
- Sanal Belge Odası için Bölüm 5'teki resmi dizin ağacını birebir kullan.
- Tablo gereken yerde tablo kullan. Varsayımları açıkça belirt.
- MÜDEK'e resmi bağlılık iddiası verme; ürünü "MÜDEK uyumlu belge ve ölçüm yönetimi aracı" olarak konumlandır.
- Doküman uzun olacağından, çok büyükse mantıklı parçalara böl (ör. A–F, G–K, L–P) ve sırayla üret.

**Çıktı biçimi:** Tek, başlıklı (A–P) Markdown tasarım dokümanı.
