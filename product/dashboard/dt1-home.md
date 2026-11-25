# DT1: Data Beranda dasbor

| Field | Tipe | Aturan |
|---|---|---|
| nama depan | teks | Dari profil pengguna |
| status verifikasi | turunan | Dari auth: kontak, 2FA, e-KYC |
| skor perlindungan | angka | 0–100%, dihitung dari langkah penyiapan yang selesai |
| paket aktif | pilihan | Basic, Plus, atau Employee |
| janji berikutnya | turunan | Dari advocate (pemesanan terdekat) |
| jumlah notifikasi belum dibaca | turunan | Dari notifications |
| ringkasan uang | turunan | Dari finance |

Dasbor tidak punya tabel sendiri kecuali skor perlindungan; sebagian besar data dibaca dari fitur lain.
