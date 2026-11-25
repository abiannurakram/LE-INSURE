# DT1: Data Feedback

| Field | Tipe | Aturan |
|---|---|---|
| pengirim | relasi | Ke pengguna |
| rating | angka | 1–5, wajib |
| fitur | pilihan | Daftar fitur + Other |
| pesan | teks | Opsional, maksimal 1.000 karakter |
| boleh dihubungi | ya/tidak | Default tidak |
| status | pilihan | Received, Planned, Done |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
