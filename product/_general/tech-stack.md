# tech-stack.md

Aturan teknologi Le-Insure untuk agent. Usulan awal mengikuti materi Vibe Coding Bagian 2; ubah bila kelompok memutuskan lain.

## Framework
- Gunakan Next.js (App Router) + TypeScript.
- Satu aplikasi web untuk website publik dan area member (dasbor).

## Database
- Lokal: SQLite (`DATABASE_URL=file:./dev.db`).
- Server (Vercel): PostgreSQL (Supabase).
- URL koneksi hanya lewat `DATABASE_URL`.
- Beda provider: ubah `provider` di schema, lalu buat ulang migrasi.

## ORM
- Gunakan Prisma, schema-first: ubah skema dulu, lalu migrasi.
- Satu `db/schema.prisma` untuk semua fitur; agent menormalisasi tabel sendiri.
- Lokal: `npx prisma migrate dev`. Produksi: `npx prisma migrate deploy`.

## Struktur
- Folder per fitur: `product/<fitur>/` dan `modules/<fitur>/`.
- Komponen bersama (tombol, kartu, input, *stepper*, modal, *sidebar*) di `shared/`.

## Standar
- Tailwind CSS, Zod (validasi), ESLint + Prettier.
- Auth: JWT di cookie `httpOnly`, `secure`, `sameSite=lax`.
- Kata sandi: bcrypt. OTP dan kode cadangan 2FA: di-*hash*, ada batas waktu dan batas percobaan.
- Rahasia hanya di `.env`; contoh nama variabel di `.env.example`.
- Uji: Vitest untuk logika, Playwright untuk alur utama (register, login).

## UI (ringkas dari brand-guideline.md)
- Warna: burgundy `#7A2433` (primer), krem `#F7EFE6` (latar), charcoal `#2B2320` (teks).
- Mode gelap: latar `#24090F`, permukaan `#39121B`, aksen `#E36B78`.
- Huruf: Space Grotesk (judul), Inter (isi). Muat dari Google Fonts.
- Logo memakai berkas SVG resmi. Wordmark tidak boleh diketik ulang.
- Gerak ringan; sediakan versi statis untuk `prefers-reduced-motion`.

## Layanan pihak ketiga (belum dipilih)
- Pengiriman OTP (email/SMS), e-KYC (NIK + *liveness*), penyimpanan berkas terenkripsi, pembayaran, AI Contract Review.
- Sampai vendor dipilih, semuanya disimulasikan: OTP ditampilkan di konsol/layar, unggahan tidak dikirim ke luar, AI memakai ringkasan contoh.

## Deploy
- GitHub (repositori `le-insure`) terhubung ke Vercel.
- Build Command (Postgres): `npx prisma generate && npx prisma migrate deploy && next build`.
- Variabel lingkungan di Vercel: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`.
