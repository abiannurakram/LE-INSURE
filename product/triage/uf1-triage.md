# UF1: Alur Legal Triage

```mermaid
flowchart TD
    S([Report legal issue]) --> T[Legal Triage: kategori + uraian]
    T --> AI[Klasifikasi AI + tinjauan manusia, maks. 1 hari kerja]
    AI --> NS[Kategori, urgensi, dokumen yang dibutuhkan, pilihan langkah]
    NS --> FA[Find an Advocate: filter bidang dan kota]
    FA --> FEE[Lihat honorarium + biaya platform Rp25.000]
    FEE --> SL[Pilih slot waktu, konfirmasi]
    SL --> NT[Notifikasi janji temu + kartu Coming up]
    NT --> SH[Bagikan dokumen dari LE-DOCS ke advokat]
    SH --> CT[Case Tracker / My Cases: status, dokumen kurang, langkah berikutnya]
    CT --> UP[Unggah dokumen yang diminta]
    UP --> CT
```

## Langkah

1. Member menekan "Report legal issue".
2. Langkah 1–4: kategori, uraian kejadian, kapan mulai, nilai sengketa (Rp), urgensi.
3. Klasifikasi AI ditinjau manusia; balasan maksimal 1 hari kerja.
4. Hasil: kategori, urgensi, dokumen yang perlu disiapkan, pilihan langkah (advokat mitra atau rujukan bantuan hukum gratis).
5. Laporan tersimpan di My Cases dengan ID kasus.

## Catatan

Advokat yang memberi nasihat hukum dan mewakili pengguna. Le-Insure menangani triase, pencocokan, jadwal, dokumen, dan status.
