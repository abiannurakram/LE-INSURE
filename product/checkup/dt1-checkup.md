# DT1: Data Legal Check-up

| Field | Tipe | Aturan |
|---|---|---|
| situasi | daftar pilihan | Satu atau lebih dari 6 situasi |
| butir daftar periksa | daftar | Teks EN/ID per situasi; dikelola tim konten |
| status butir | pilihan | Siap atau belum, per pengguna |
| tanggal diperbarui | tanggal-waktu | Otomatis |
| skor kuis kesiapan | angka | 0–100; dari website bila pengguna mengerjakan sebelum daftar |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
