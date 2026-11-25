# US1: Register dan verifikasi akun

Fitur: `auth` · Pengguna: Pengunjung (P1) · Akses: publik

> Batas peran: Le-Insure tidak melakukan *underwriting*, tidak memberi nasihat hukum, dan tidak menjamin hasil hukum. Lihat `AGENTS.md`.

## US-10 · Membuat akun
Status: **Dibangun**

Sebagai pengunjung, saya ingin membuat akun dengan data dasar, agar saya bisa memakai layanan gratis.
- Isian: nama lengkap, email, telepon (+62), kata sandi, dan persetujuan syarat.
- Validasi: format email, nomor ponsel Indonesia, kata sandi minimal 8 karakter dengan indikator kekuatan.

## US-11 · Mendaftar dengan Google
Status: **Dibangun (simulasi)**

Sebagai pengunjung, saya ingin mendaftar dengan akun Google, agar pendaftaran lebih cepat.
- Tombol "Continue with Google" di langkah 1.
- Email dianggap sudah terverifikasi, jadi hanya OTP telepon lewat SMS yang diminta.
- Catatan: Google *sign-in* nyata membutuhkan *backend* dan *client ID* Google Cloud.

## US-12 · Memverifikasi akun dengan OTP
Status: **Dibangun (simulasi)**

Sebagai pengguna baru, saya ingin memasukkan kode 6 digit, agar akun saya terbukti milik saya.
- Kode dikirim lewat email atau SMS, dan pengguna bisa beralih kanal di layar yang sama.
- Tersedia tombol kirim ulang. Di pratinjau, kode ditampilkan di layar.

## US-13 · Mengaktifkan 2FA
Status: **Dibangun (boleh dilewati)**

Sebagai pengguna, saya ingin menambah langkah kedua saat masuk, agar dokumen saya tetap aman meski kata sandi bocor.
- Pilihan *passkey* atau aplikasi *authenticator* (QR contoh dan kunci pengaturan, lalu kode 6 digit).
- Langkah ini boleh dilewati dan bisa diaktifkan kemudian di Security.

## US-14 · Menyelesaikan e-KYC
Status: **Dibangun (simulasi, boleh dilewati)**

Sebagai pengguna, saya ingin memverifikasi identitas sekali, agar saya bisa memakai layanan yang membutuhkan identitas terverifikasi.
- Isian NIK 16 digit, foto KTP (JPG/PNG), dan cek wajah/*liveness* (lihat ke layar, menoleh, berkedip).
- Sistem menolak lanjut bila NIK belum lengkap, foto KTP belum ada, atau cek wajah belum selesai.

## US-15 · Melihat layanan yang terbuka
Status: **Dibangun (tingkat akses masih usulan)**

Sebagai pengguna baru, saya ingin melihat layanan mana yang sudah terbuka, agar saya tahu langkah verifikasi apa yang perlu diselesaikan.
- Langkah 5 menampilkan tiga tingkat: akun terverifikasi (Check-up, Triage, LE-DOCS), 2FA aktif (berbagi dokumen, AI Contract Review, Case Tracker), e-KYC lolos (pemesanan advokat, LPP, LE-LEGACY).
- Ada tombol untuk menyelesaikan langkah yang dilewati.
- Catatan: di prototipe, tingkat ini hanya ditampilkan dan belum mengunci fitur di dasbor (lihat §5).
