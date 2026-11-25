# DT2: Data Login

| Field | Tipe | Aturan |
|---|---|---|
| email | teks | Wajib, harus terdaftar |
| kata sandi | teks | Dicocokkan dengan hash |
| ingat saya | ya/tidak | Memperpanjang masa sesi |
| sesi | teks | JWT di cookie httpOnly; ada waktu kedaluwarsa |
| riwayat login | daftar | Waktu, perangkat, peramban, kota, metode, hasil (berhasil/diblokir) |
| token reset kata sandi | teks | Disimpan sebagai hash, sekali pakai, ada batas waktu |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
