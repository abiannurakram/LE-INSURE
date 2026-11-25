# AGENTS.md: Le-Insure

Aturan untuk semua agent AI (Claude Code, Antigravity, Gemini CLI, Codex, dan lainnya) yang bekerja di repositori ini.

Le-Insure adalah platform perlindungan digital dengan tagline **"Digital Protection for Your Rights & Legacy"**. Layanannya disusun dalam kerangka Prepare–Protect–Preserve (kerangka layanan, bukan tagline).

## Batas peran (WAJIB, berlaku di semua fitur)

- Le-Insure adalah platform teknologi. Le-Insure **tidak** melakukan *underwriting*, **tidak** memberi nasihat hukum, dan **tidak** menjamin hasil hukum.
- Polis diterbitkan dan klaim diputus oleh perusahaan asuransi mitra berizin OJK.
- Nasihat dan jasa hukum diberikan oleh advokat mitra.
- Akta dan wasiat dibuat oleh notaris mitra. LE-LEGACY **bukan** pengganti wasiat.
- Jangan menulis teks UI, komentar, atau data contoh yang melanggar batas di atas. Jangan menampilkan logo OJK seolah-olah Le-Insure berizin.

## Struktur

- Kelompokkan fitur per folder.
- Nama folder `product/<fitur>/` HARUS sama dengan `modules/<fitur>/`.
- Fitur yang ada: `auth`, `website`, `dashboard`, `checkup`, `contract`, `docs`, `triage`, `advocate`, `cases`, `lpp`, `legacy`, `finance`, `notifications`, `feedback`, `account`, `support`.
- Komponen dan util yang dipakai lebih dari satu fitur masuk `shared/`.
- Skema dan migrasi database masuk `db/`.
- Catatan proses dan log prompt masuk `project/`.

## Konteks umum (baca dulu)

- `product/_general/prd.md`
- `product/_general/brand-guideline.md`
- `product/_general/tech-stack.md`

## Konteks fitur: `product/<fitur>/`

Setiap folder fitur berisi file dengan awalan berikut. Angka menunjukkan sub-fitur (misalnya `1-register`, `2-login`).

| Awalan | Isi |
|---|---|
| `us` | *User story* dan kriteria penerimaan |
| `uf` | *User flow* (langkah dan cabang keputusan) |
| `wf` | *Wireframe* dalam bentuk teks |
| `mo` | *Mockup* (gambar .png) |
| `dt` | Data yang dibutuhkan fitur |

Label status pada *user story* (mengikuti prototipe website v36):

- **Dibangun**: sudah ada desain dan perilakunya di prototipe.
- **Fase 2**: hanya tampilan atau daftar tunggu; layanan dibuka 2028.
- **Celah**: kebutuhan persona yang belum punya desain. Jangan dikerjakan tanpa persetujuan.

Lingkup MVP ditetapkan di `project/status.md`. Kerjakan hanya fitur yang di sana ditandai masuk MVP.

## Output

- Tulis kode di `modules/<fitur>/`, sesuai struktur `product/`.
- Baca SEMUA dokumen fitur (us, uf, wf, mo, dt) sebelum menulis kode.
- Satu prompt, satu fitur. Laporkan file yang dibuat atau diubah.
- Jangan mengubah isi `product/` kecuali diminta.

## Database (schema-first)

- Satu `db/schema.prisma` untuk SEMUA fitur. Jangan membuat skema per fitur.
- Baca semua `product/*/dt*.md`.
- Atur sendiri tabel dan relasinya: normalisasi (hindari data ganda), tentukan kunci utama dan kunci asing.
- Tambahkan kolom teknis yang perlu (`passwordHash`, `createdAt`, `updatedAt`).
- Setelah skema berubah, jalankan `npx prisma migrate dev --name <deskripsi-singkat>`.
- Jangan edit migrasi yang sudah dijalankan.
- Laporkan tabel yang dibuat atau diubah.
- Jangan ubah tabel yang dipakai fitur lain tanpa menyebut alasannya.

## Data sensitif (UU PDP)

- Kata sandi, kode OTP, dan kode cadangan 2FA disimpan sebagai *hash*, tidak pernah sebagai teks biasa.
- NIK, foto KTP, data *liveness*, dan berkas LE-DOCS disimpan terenkripsi dan tidak pernah ditulis ke log.
- Rahasia (URL database, JWT secret, kunci API) hanya di `.env`. Jangan pernah di-*commit*.
- Pemberi kerja (Paket Karyawan) hanya boleh melihat data agregat, tidak pernah isi kasus karyawan.

## Bahasa

- Antarmuka dwibahasa EN/ID. Nama produk tetap: Legal Check-up, AI Contract Review, LE-DOCS, Legal Triage, Case Tracker, Legal Protection Plan (LPP), LE-LEGACY.
- Teks berbahasa Indonesia memakai bahasa baku. Desimal memakai koma, ribuan memakai titik (Rp29.000).
- Data contoh (nama advokat, notaris, nomor kasus, nominal) harus ditandai sebagai contoh.
