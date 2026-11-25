# DT1: Data Account & Security

| Field | Tipe | Aturan |
|---|---|---|
| tanggal lahir | tanggal | Opsional |
| alamat | teks | Opsional |
| foto profil | berkas | Opsional |
| perangkat aktif | daftar | Perangkat, peramban, kota, terakhir aktif; bisa dicabut |
| kode cadangan 2FA | daftar | Disimpan sebagai hash, sekali pakai |
| izin data | daftar ya/tidak | Advokat lihat dokumen kasus, asuransi lihat berkas klaim, data penggunaan anonim, email promosi |
| persetujuan | tanggal-waktu | Syarat & Kebijakan Privasi, versi dokumen |
| permintaan data | daftar | Unduh data / koreksi, dengan status |
| penghapusan akun | tanggal-waktu | Data kasus aktif dan catatan asuransi mengikuti aturan retensi masing-masing |

Data akun dasar (nama, email, telepon, 2FA, e-KYC) sudah didefinisikan di `auth/dt1-register.md`. Jangan diduplikasi.
