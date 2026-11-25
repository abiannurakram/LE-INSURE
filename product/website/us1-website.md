# US1: Website publik

Fitur: `website` · Pengguna: Pengunjung (P1), Pembeli korporat (P6) · Akses: publik

> Batas peran: Le-Insure tidak melakukan *underwriting*, tidak memberi nasihat hukum, dan tidak menjamin hasil hukum. Lihat `AGENTS.md`.

## US-01 · Memahami Le-Insure dari halaman depan
Status: **Dibangun**

Sebagai pengunjung, saya ingin melihat apa yang ditawarkan Le-Insure di halaman depan, agar saya tahu apakah layanan ini relevan bagi saya.
- Hero menampilkan globe dengan logo dan tagline "Digital Protection for Your Rights & Legacy".
- Bagian Our Services menampilkan tiga kolom: Prepare, Protect, Preserve.
- Setiap kartu layanan membuka modal detail yang memuat apa yang didapat, siapa melakukan apa, dan batas peran (misalnya "The AI only flags clauses for review. It does not give legal advice.").

## US-02 · Mengukur kesiapan lewat kuis
Status: **Dibangun**

Sebagai pengunjung, saya ingin mengerjakan kuis singkat, agar saya tahu seberapa siap saya menghadapi risiko hukum.
- Tombol "Check your readiness" membuka kuis 5 pertanyaan.
- Hasil berupa skor 0–100, tingkat kesiapan, dan daftar celah beserta layanan Le-Insure yang relevan.
- Bila pengguna sudah login, langkah pertama di dasbor otomatis tercentang.

## US-03 · Membaca tips harian
Status: **Dibangun**

Sebagai pengunjung, saya ingin membaca tips hukum singkat, agar saya mendapat edukasi tanpa harus mendaftar.
- *Ticker* "Daily insights" berjalan di antara hero dan Our Services.
- Setiap tips membuka modal berisi penjelasan singkat.

## US-04 · Mencari informasi di situs
Status: **Dibangun**

Sebagai pengunjung, saya ingin mencari kata kunci, agar saya cepat menemukan layanan atau jawaban.
- Ikon pencarian di navigasi membuka kotak pencarian dengan saran ("contract", "advocate", "legacy").

## US-05 · Memilih bahasa dan tema
Status: **Dibangun**

Sebagai pengunjung, saya ingin mengganti bahasa dan tema, agar situs nyaman dibaca.
- Tombol EN/ID terpisah di samping navigasi. Nama produk tetap dalam bahasa Inggris.
- Tombol tema mengganti mode terang dan gelap.

## US-06 · Mengenal perusahaan dan ekosistemnya
Status: **Dibangun**

Sebagai pengunjung, saya ingin tahu siapa Le-Insure dan dengan siapa bermitra, agar saya bisa menilai apakah platform ini layak dipercaya.
- About Us memuat Who We Are, Why We Exist, Our Ecosystem (asuransi berizin OJK, broker berizin, advokat, notaris, pemberi kerja, e-KYC, *e-signature*), Our Philosophy, dan Meet the Team.
- Tidak ada logo OJK yang mengesankan Le-Insure berizin.

## US-07 · Memahami cakupan Legal Protection Plan
Status: **Fase 2**

Sebagai calon pemegang LPP, saya ingin melihat apa yang ditanggung dan tidak ditanggung, agar saya tahu batas perlindungannya sebelum bergabung.
- Halaman Insurance Coverage menampilkan cakupan (ketenagakerjaan, sewa hunian, konsumen dan transaksi digital, kontrak pribadi).
- Batas ilustratif ditampilkan: Rp25.000.000 per kasus, Rp50.000.000 per tahun, masa tunggu 90 hari, risiko sendiri 10%, premi ritel Rp40.000/bulan yang dibayar ke perusahaan asuransi.
- Pengecualian ditampilkan: sengketa sebelum polis (termasuk masa tunggu), kejahatan disengaja, klaim tanpa dasar wajar.
- Ada catatan bahwa Le-Insure tidak melakukan *underwriting* dan tidak memutus klaim.

## US-08 · Memahami alur bantuan dan klaim
Status: **Dibangun (bagian 2: Fase 2)**

Sebagai pengunjung, saya ingin melihat langkah dari melapor sampai biaya dibayar, agar saya tahu apa yang terjadi dan siapa yang bertanggung jawab di tiap langkah.
- Claims & Assistance menampilkan 8 langkah dalam 2 bagian, dengan kolom pelaksana (Anda, Le-Insure, advokat mitra, perusahaan asuransi).
- Ada daftar dokumen yang perlu disiapkan dan FAQ.
- Pengaduan klaim diarahkan ke perusahaan asuransi terlebih dahulu, lalu ke layanan pengaduan konsumen OJK.

## US-09 · Membandingkan paket
Status: **Dibangun**

Sebagai pengunjung, saya ingin membandingkan paket dan harga, agar saya bisa memilih yang sesuai kebutuhan dan anggaran.
- Plans & Pricing menampilkan Basic (gratis), Plus (Rp29.000/bulan atau Rp290.000/tahun), Paket Karyawan (Rp15.000 per karyawan per bulan), dan LPP Ritel (Fase 2).
- Tabel perbandingan dikelompokkan per Prepare, Protect, Preserve, dan For teams.
- Honorarium advokat dan notaris disebut dibayar penuh kepada mereka dan ditampilkan sebelum pemesanan.

## US-58 · Mengajukan minat Paket Karyawan
Status: **Dibangun (formulir saja)**

Sebagai manajer SDM, saya ingin mengajukan minat Paket Karyawan, agar tim penjualan menghubungi saya.
- Tombol "Start with Employee Package" di Plans & Pricing membuka formulir nama perusahaan dan email kerja.
- Konfirmasi: tim akan menghubungi dalam 2 hari kerja.
- Dasbor SDM, aktivasi karyawan, dan SSO kantor belum ada (lihat §5).
