# UF1: Alur beranda dasbor

```mermaid
flowchart TD
    L([Login]) --> D[Dashboard]
    D --> V{Verifikasi lengkap?}
    V -- Belum --> FV[Finish verification -> auth langkah 3/4]
    D --> QA[Aksi cepat]
    QA --> CU[checkup] & CR[contract] & UP[docs] & TR[triage] & CS[cases]
    D --> N[notifications]
    D --> F[finance]
```

## Langkah

1. Setelah login, member masuk `/dashboard`.
2. Sapaan sesuai waktu + nama depan.
3. Kartu status: verifikasi (kontak, 2FA, e-KYC) dengan "Finish verification", skor perlindungan (%), paket, keamanan.
4. Aksi cepat: Start legal check-up, Review contract, Upload document, Report legal issue, View my cases.
5. Kartu Coming up (janji advokat terdekat), pusat notifikasi (jumlah belum dibaca), ringkasan uang.
6. Akses cepat ke My Protection, LE-DOCS, Legacy Planning, My Cases, Finance, Account & Security.
