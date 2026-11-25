# UF1: Alur LPP

```mermaid
flowchart TD
    W([Join the waitlist di My Protection]) --> P[Polis diterbitkan perusahaan asuransi mitra berizin OJK]
    P --> MT[Masa tunggu 90 hari]
    MT --> DS[Sengketa tercakup muncul]
    DS --> N[05 Lapor lebih awal ke perusahaan asuransi lewat Le-Insure]
    N --> F[06 Siapkan berkas dari LE-DOCS: polis, kronologi, bukti, estimasi advokat]
    F --> RV[07 Perusahaan asuransi meninjau sesuai polis]
    RV --> DEC{Keputusan perusahaan asuransi}
    DEC -- Diterima --> PAY[08 Biaya dibayar sampai batas, dikurangi risiko sendiri 10%]
    DEC -- Ditolak --> CP[Pengaduan ke perusahaan asuransi, lalu layanan pengaduan konsumen OJK]
```

## Langkah

1. Member membuka Legal Protection Plan: status "Not active yet".
2. "Join the waitlist" / "Leave waitlist".
3. Fase 2: polis diterbitkan perusahaan asuransi mitra, masa tunggu 90 hari.
4. Fase 2: klaim (langkah 05–08) diajukan ke perusahaan asuransi lewat Le-Insure dengan berkas dari LE-DOCS.

## Catatan

Di prototipe, hanya langkah daftar tunggu yang bisa diklik. Langkah 05–08 baru dijelaskan di halaman Claims & Assistance.
