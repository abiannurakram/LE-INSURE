# DT1: Data Notifications

| Field | Tipe | Aturan |
|---|---|---|
| penerima | relasi | Ke pengguna |
| jenis | pilihan | Kedaluwarsa kontrak, kedaluwarsa dokumen, status kasus, janji advokat, polis/klaim, keamanan |
| judul | teks | EN/ID |
| tautan | teks | Ke halaman terkait |
| dibaca | ya/tidak | Default tidak |
| dibuat | tanggal-waktu | Otomatis |
| preferensi | daftar ya/tidak | Per jenis, per pengguna |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
