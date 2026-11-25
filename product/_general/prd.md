# PRD Le-Insure

**Digital Protection for Your Rights & Legacy**

Kelompok 4 · Karya Inovasi Keuangan Digital (KIKD) 2026 · Administrasi Keuangan dan Perbankan, Sekolah Vokasi Universitas Indonesia
Versi 1.0 · 16 November 2026

Sumber: naskah final, `LeInsure_00_Konteks_Utama.md`, User Stories & User Flow v1.0, Website v36, User Persona v1.0. Bila ada perbedaan, naskah final dan angka kanonik yang berlaku.

---

## 1. Ringkasan produk

Le-Insure adalah platform perlindungan digital yang menggabungkan edukasi hukum, brankas dokumen, rujukan advokat terverifikasi, perlindungan biaya hukum dari perusahaan asuransi berizin OJK, dan perencanaan *legacy* dalam satu alur. Le-Insure mendampingi pengguna sebelum, saat, dan setelah masalah hukum terjadi.

## 2. Masalah

- Kesenjangan literasi dan inklusi asuransi. SNLIK 2026 sektor asuransi: literasi 42,84%, inklusi 29,55%.
- Akses bantuan hukum yang mahal dan terfragmentasi.
- Biaya hukum tak terduga yang bisa menjadi guncangan keuangan rumah tangga.
- Dokumen penting yang tersebar.
- Perencanaan warisan yang belum formal.

## 3. Batas peran (model *asset-light*)

| Pihak | Peran |
|---|---|
| Le-Insure | Teknologi, orkestrasi, pengalaman pengguna, edukasi |
| Perusahaan asuransi berizin OJK | Penanggung risiko dan penerbit polis LPP; memutus klaim |
| Pialang asuransi berizin | Kanal distribusi LPP pada fase awal |
| Advokat mitra | Nasihat dan jasa hukum |
| Notaris mitra | Akta, termasuk wasiat |
| Pemberi kerja | Kanal B2B2C (Paket Karyawan) |
| Penyedia teknologi | e-KYC, tanda tangan elektronik, *cloud* |

Le-Insure tidak melakukan *underwriting*, tidak memberi nasihat hukum, dan tidak menjamin hasil hukum. LE-LEGACY bukan pengganti wasiat. Cakupan tidak meliputi asuransi kesehatan, jiwa, atau kendaraan.

## 4. Pengguna

| Kode | Peran | Persona |
|---|---|---|
| P1 | Pengunjung | Semua persona |
| P2 | Member Basic (gratis) | Nadia, Pak Bambang, Hendra & Sari (awal) |
| P3 | Member Plus | Hendra & Sari |
| P4 | Member Paket Karyawan | Raka |
| P5 | Calon pemegang LPP (Fase 2) | Raka, Hendra & Sari |
| P6 | Pembeli korporat (manajer SDM) | Dina |

Segmen awal: pemberi kerja menengah-besar di Jabodetabek dan Jawa Barat dengan karyawan formal. Persona Pak Bambang dan Nadia masih menunggu persetujuan kelompok.

## 5. Fitur dan folder

| Kerangka | Fitur (nama baku) | Folder `product/` |
|---|---|---|
| — | Register, login, verifikasi | `auth/` |
| — | Website publik (landing, cakupan, klaim, harga, tentang) | `website/` |
| — | Beranda dasbor | `dashboard/` |
| Prepare | Legal Check-up & Pusat Edukasi | `checkup/` |
| Prepare | AI Contract Review (hanya menandai klausul) | `contract/` |
| Prepare/Preserve | LE-DOCS (brankas terenkripsi + pengingat) | `docs/` |
| Protect | Legal Triage (AI + peninjau manusia) | `triage/` |
| Protect | Rujukan Advokat Mitra | `advocate/` |
| Protect | Case Tracker / My Cases | `cases/` |
| Protect | Legal Protection Plan (Fase 2) | `lpp/` |
| Preserve | LE-LEGACY | `legacy/` |
| Pendukung | Finance | `finance/` |
| Pendukung | Notifications | `notifications/` |
| Pendukung | Feedback | `feedback/` |
| Pendukung | Profile, Security, Privacy | `account/` |
| Pendukung | Help Center, Contact Support | `support/` |

## 6. Paket dan harga

| Paket / layanan | Harga | Isi |
|---|---|---|
| Le-Insure Basic | Gratis | Edukasi, Legal Check-up, brankas 1 GB, triase awal |
| Le-Insure Plus | Rp29.000/bulan atau Rp290.000/tahun | AI Contract Review, brankas 20 GB, pengingat, Case Tracker, LE-LEGACY dasar |
| Paket Karyawan (B2B2C) | Rp15.000 per karyawan per bulan | Fitur Plus + 1 konsultasi 30 menit per tahun + edukasi; opsi LPP grup |
| LPP ritel (Fase 2) | Premi Rp40.000/bulan, dibayar ke perusahaan asuransi | Batas Rp25 juta per kasus, Rp50 juta per tahun; masa tunggu 90 hari; risiko sendiri 10% |
| Sesi konsultasi | Biaya platform Rp25.000 | Honorarium advokat terpisah, diterima utuh oleh advokat |
| Paket penataan *legacy* | Biaya platform Rp250.000 | Honorarium notaris dibayar langsung ke notaris |

Ketentuan LPP bersifat ilustratif. Cakupan: ketenagakerjaan, sewa/hunian, konsumen & transaksi digital, kontrak pribadi. Pengecualian: sengketa sebelum polis, kejahatan disengaja, perkara tanpa dasar wajar.

## 7. Tingkat akses (usulan, menunggu keputusan)

| Status akun | Layanan yang terbuka |
|---|---|
| Akun terverifikasi (OTP) | Check-up, Triage, penyimpanan LE-DOCS |
| + 2FA aktif | Berbagi dokumen, AI Contract Review, Case Tracker |
| + e-KYC lolos | Pemesanan advokat, LPP, LE-LEGACY |

## 8. Peluncuran bertahap

| Fase | Fokus | KPI |
|---|---|---|
| MVP (target Desember 2026) | Lingkup ditetapkan di `project/status.md` | — |
| Fase 1 (2027) | Edukasi, triase, LE-DOCS, rujukan advokat, pemeriksaan kontrak, Case Tracker dasar, LE-LEGACY dasar; pilot 3–5 pemberi kerja | 15.000 pengguna; 5.000 karyawan; konversi 4% |
| Fase 2 (2028) | LPP ritel dan grup bersama asuransi berizin lewat pialang | 50.000 pengguna; 25.000 karyawan; 2.000 polis LPP |
| Fase 3 (2029–2031) | LE-LEGACY + notaris, integrasi bank digital/HRIS | s.d. 400.000 pengguna dan 220.000 karyawan pada 2031 |

Proyeksi keuangan: EBITDA positif 2030, dana puncak ±Rp14,94 miliar.

Prasyarat regulasi Fase 1: pendaftaran PSE, program PDP dan pejabat PDP, opini hukum UU Advokat.

## 9. Persyaratan non-fungsional

- Keamanan: OTP, 2FA (*passkey* atau aplikasi *authenticator*), enkripsi data sensitif, riwayat login, keluar dari perangkat lain.
- Privasi: sesuai UU PDP; pengguna bisa mengunduh data, meminta koreksi, mencabut akses, dan menghapus akun.
- Aksesibilitas: kontras cukup, status tidak hanya ditandai warna, target sentuh minimal 44 px.
- Bahasa: EN/ID; mode terang dan gelap.
- Kinerja: gerak ringan, ada cadangan statis.

## 10. Di luar cakupan MVP (celah yang tercatat)

- Dasbor SDM, SSO kantor, aktivasi karyawan.
- Alur pembayaran nyata.
- Layar pengajuan klaim LPP.
- Antarmuka sisi mitra (advokat, notaris, peninjau triase).
