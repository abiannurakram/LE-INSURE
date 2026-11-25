# DT1: Data Finance

| Field | Tipe | Aturan |
|---|---|---|
| transaksi: tanggal | tanggal | Wajib |
| transaksi: item | teks | Paket, biaya platform, honorarium, refund |
| transaksi: dibayar kepada | teks | Le-Insure, advokat, notaris, atau perusahaan asuransi |
| transaksi: jumlah | angka (Rp) | Bilangan bulat rupiah |
| transaksi: jenis | pilihan | Pembayaran, payout, refund |
| anggaran bulanan | angka (Rp) | Minimal Rp50.000 |
| metode pembayaran | pilihan | E-wallet, VA, kartu (belum terhubung) |
| langganan | relasi | Paket + tanggal perpanjangan |

Data diberikan per fitur. Agent menormalisasinya ke satu `db/schema.prisma` (lihat `AGENTS.md`).
