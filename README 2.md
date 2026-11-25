# Le-Insure

**Digital Protection for Your Rights & Legacy**

Repositori proyek Le-Insure, Kelompok 4 KIKD 2026 (Abian Nurakram Suwasono; Dzamar Widianto; Erlangga Wirapati Chandranaya; Silvia Dara Santi; Wira Jati Susanto).

Struktur mengikuti materi Vibe Coding Bagian 2: dokumen di `product/`, kode di `modules/`, dengan nama folder fitur yang sama.

```
le-insure/
├── CLAUDE.md          pintu masuk Claude Code (mengimpor AGENTS.md)
├── GEMINI.md          pintu masuk Antigravity / Gemini CLI
├── AGENTS.md          aturan untuk semua agent
├── product/           dokumen: apa yang dibangun
│   ├── _general/      prd.md, brand-guideline.md, tech-stack.md
│   └── <fitur>/       us, uf, wf, mo, dt per fitur (16 fitur)
├── modules/<fitur>/   kode, satu folder per fitur (masih kosong)
├── db/                schema.prisma dan migrasi (belum ada)
├── shared/            komponen bersama + logo SVG
└── project/           status.md, prompt-log.md
```

## Mulai

1. Baca `project/status.md`. Lingkup MVP belum ditetapkan.
2. Setelah lingkup disepakati, buat aplikasi Next.js di folder ini (lihat `product/_general/tech-stack.md`).
3. Salin `.env.example` ke `.env`.
4. Kerjakan satu fitur per prompt. Contoh prompt ada di `project/prompt-log.md`.
