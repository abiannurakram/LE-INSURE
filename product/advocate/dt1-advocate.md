# DT1: Data Rujukan Advokat Mitra

| Field | Tipe | Aturan |
|---|---|---|
| advokat: nama dan gelar | teks | Wajib |
| advokat: nomor izin praktik | teks | Wajib; diverifikasi sebelum tampil |
| advokat: bidang | daftar pilihan | Ketenagakerjaan, sewa/properti, konsumen & digital, keluarga & waris, kontrak |
| advokat: kota | teks | Wajib |
| advokat: kanal | pilihan | Daring, tatap muka, atau keduanya |
| advokat: honorarium | angka (Rp) | Per sesi, ditentukan advokat |
| slot jadwal | tanggal-waktu | Disediakan advokat |
| pemesanan | relasi | Pengguna + advokat + slot + kasus (opsional) |
| biaya platform | angka (Rp) | Rp25.000 per sesi |
| kuota konsultasi tahunan | angka | 1 sesi 30 menit per tahun untuk Paket Karyawan |
| status pemesanan | pilihan | Dipesan, selesai, dibatalkan, dijadwalkan ulang |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
