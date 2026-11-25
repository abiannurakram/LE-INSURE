# Prompt log

Catat setiap prompt penting ke agent: tanggal, siapa, agent yang dipakai, prompt, dan hasilnya.

| Tanggal | Anggota | Agent | Prompt (ringkas) | Hasil / file yang berubah |
|---|---|---|---|---|
| 25 Nov 2026 | Abian | Claude Code | Ubah prototipe `Le-Insure.html` (v29) menjadi Next.js: `globals.css`, `layout.tsx`, `page.tsx` | `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (markup per bagian), `public/le-insure/app.js` (perilaku dari prototipe). `npm run build` lolos. |
| 25 Nov 2026 | Abian | Claude Code | Pastikan semua identitas merek di web mengikuti Brand Guideline v1.0 | Logo diganti artwork vektor resmi (Primary, Symbol Bar, Compact Mark, Reverse), warna di luar palet dipetakan ke palet, token light/dark sesuai tabel, skala tipografi, tombol 8 px, input 6 px, kartu 8 px dengan garis 1,5 px, chip status berikon, kaca hanya di nav/panel. File: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `public/le-insure/app.js`, `app/icon.svg` (baru), `app/favicon.ico` (dihapus). |

## Contoh prompt fitur pertama

```
Kerjakan fitur register Le-Insure.
Baca product/_general/ dan product/auth/
(us1, uf1, wf1, mo1, dt1-register).
Atur sendiri db/schema.prisma: normalisasi
tabel dari dt1-register.md, lalu migrasi.
Tulis kode di modules/auth/ sesuai wireframe.
Kata sandi di-hash (bcrypt), validasi Zod.
OTP: tampilkan di konsol dulu (simulasi).
```
