# DT1: Data Register

| Field | Tipe | Aturan |
|---|---|---|
| id | teks | Unik, dibuat otomatis |
| nama lengkap | teks | Wajib, 2–100 karakter |
| email | teks | Unik, wajib, format email |
| telepon | teks | Unik, wajib, format +62 |
| kata sandi | teks | Wajib, minimal 8 karakter; disimpan sebagai hash |
| setuju syarat | tanggal-waktu | Wajib; waktu persetujuan dicatat |
| metode daftar | pilihan | Email atau Google |
| kode OTP | teks | 6 digit, disimpan sebagai hash, ada batas waktu dan batas percobaan |
| kanal OTP | pilihan | Email atau SMS |
| status kontak | pilihan | Belum terverifikasi atau terverifikasi |
| 2FA | pilihan | Mati, passkey, atau authenticator; kunci rahasia terenkripsi |
| NIK | teks | 16 digit, terenkripsi, opsional saat register |
| foto KTP | berkas | JPG/PNG, terenkripsi, opsional saat register |
| status e-KYC | pilihan | Belum, diproses, lolos, atau gagal |

Agent menormalisasi data ini, misalnya OTP, 2FA, dan e-KYC di tabel sendiri yang terhubung ke pengguna.
