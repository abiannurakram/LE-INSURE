# US2: Login dan pemulihan kata sandi

Fitur: `auth` · Pengguna: Member (P2–P4) · Akses: publik

> Batas peran: Le-Insure tidak melakukan *underwriting*, tidak memberi nasihat hukum, dan tidak menjamin hasil hukum. Lihat `AGENTS.md`.

## US-16 · Masuk ke akun
Status: **Dibangun**

Sebagai member, saya ingin masuk dengan email dan kata sandi, agar saya bisa membuka dasbor.
- Bila 2FA aktif, sistem meminta kode 2FA setelah kata sandi.
- Tombol Google memasukkan pengguna yang mendaftar lewat Google. Bila belum terdaftar, pengguna diarahkan ke register mode Google.
- Ada opsi "Remember me".

## US-17 · Memulihkan kata sandi
Status: **Dibangun (simulasi)**

Sebagai member yang lupa kata sandi, saya ingin meminta tautan pengaturan ulang, agar saya bisa masuk lagi.
- "Forgot password?" meminta email terisi lebih dulu. Di pratinjau, sistem hanya menampilkan pesan bahwa tautan akan dikirim.
