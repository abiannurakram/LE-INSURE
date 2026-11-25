# UF2: Alur Login

```mermaid
flowchart TD
    S([Klik Login]) --> M{Metode?}
    M -- Email + kata sandi --> P{Benar?}
    P -- Tidak --> E[Pesan kesalahan] --> M
    P -- Ya --> T{2FA aktif?}
    T -- Ya --> C[Masukkan kode 2FA] --> D([Dasbor])
    T -- Tidak --> D
    M -- Google --> GR{Terdaftar via Google?}
    GR -- Ya --> D
    GR -- Tidak --> RG[Buka Register mode Google]
    M -- Lupa kata sandi --> FP{Email terisi?}
    FP -- Tidak --> FPE[Minta isi email dulu]
    FP -- Ya --> FPL[Tautan reset dikirim ke email]
```

## Langkah

1. Pengguna membuka `/login`.
2. Masuk dengan email + kata sandi, *passkey*, atau Google.
3. Kata sandi salah: pesan galat umum (tidak menyebut field mana yang salah).
4. Bila 2FA aktif, modal meminta kode 6 digit dari aplikasi *authenticator* atau *passkey*.
5. Sukses: sesi dibuat (JWT di cookie httpOnly), arahkan ke `/dashboard`, catat riwayat login.
6. Google belum terdaftar: arahkan ke register mode Google.
7. Lupa kata sandi: email harus terisi, lalu tautan reset dikirim.
