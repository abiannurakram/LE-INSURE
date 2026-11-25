# UF1: Alur Account & Security

```mermaid
flowchart TD
    S([Account Settings & Security]) --> PF[Profile]
    S --> SE[Security]
    S --> PV[Privacy]
    SE --> PW[Ganti kata sandi]
    SE --> TF[Aktif/nonaktifkan 2FA -> notifikasi keamanan]
    SE --> DV[Perangkat aktif + riwayat login -> Log out other devices]
    PV --> PM[Sakelar izin data]
    PV --> SH[Dokumen dibagikan -> Revoke]
    PV --> DR[Download my data / Request a correction]
    PV --> DL[Delete account -> ketik DELETE]
```

## Langkah

1. Profile: ubah data pribadi; ubah email/telepon memerlukan OTP ulang; lihat status e-KYC (NIK disamarkan).
2. Security: ganti kata sandi (lama + baru + konfirmasi), kelola 2FA, lihat perangkat aktif dan riwayat login, keluar dari perangkat lain.
3. Privacy: sakelar izin data, daftar dokumen yang dibagikan + Revoke, unduh data, minta koreksi, hapus akun (ketik DELETE).
