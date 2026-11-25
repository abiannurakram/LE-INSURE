# DT1: Data LE-DOCS

| Field | Tipe | Aturan |
|---|---|---|
| id | teks | Unik, dibuat otomatis |
| pemilik | relasi | Ke pengguna |
| nama berkas | teks | Wajib |
| kategori | pilihan | Personal, Family, Property & Assets, Contracts, Insurance |
| berkas | berkas | Terenkripsi; ukuran dihitung ke kuota |
| tanggal kedaluwarsa | tanggal | Opsional; memicu pengingat |
| berbagi: penerima | relasi | Advokat atau notaris mitra |
| berbagi: berlaku sampai | tanggal | Wajib saat berbagi; bisa dicabut |
| kuota | angka | 1 GB (Basic) atau 20 GB (Plus/Employee) |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
