# DT1: Data Legal Triage

| Field | Tipe | Aturan |
|---|---|---|
| kategori | pilihan | Sewa/hunian, ketenagakerjaan, konsumen & digital, kontrak pribadi, lainnya |
| uraian | teks | Wajib |
| tanggal mulai | tanggal | Wajib |
| nilai sengketa | angka (Rp) | Opsional |
| urgensi | pilihan | Rendah, tenggat dekat, mendesak |
| klasifikasi AI | teks | Hasil awal |
| peninjau | relasi | Petugas triase; tinjauan maksimal 1 hari kerja |
| dokumen dibutuhkan | daftar | Dari hasil triase |
| kasus | relasi | Membuat kasus baru di cases |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
