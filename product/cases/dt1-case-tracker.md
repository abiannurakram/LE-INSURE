# DT1: Data Case Tracker

| Field | Tipe | Aturan |
|---|---|---|
| ID kasus | teks | Unik, format LI-TTTT-NNNN |
| pemilik | relasi | Ke pengguna |
| kategori | pilihan | Sama dengan triage |
| tanggal diajukan | tanggal | Otomatis |
| status | pilihan | Reported, Classified, In review, With advocate, Closed |
| advokat | relasi | Opsional |
| langkah berikutnya | teks | Dengan tenggat |
| dokumen diminta | daftar | Nama + status (diunggah/dibutuhkan) + tautan ke LE-DOCS |
| riwayat | daftar | Tanggal + kejadian |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
