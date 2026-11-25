# UF1: Alur Case Tracker

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

1. Kasus dibuat dari Legal Triage dengan ID (format LI-TTTT-NNNN).
2. Status bergerak: Reported → Classified → In review → With advocate → Closed.
3. Daftar dokumen yang diminta; dokumen kurang ditandai dan bisa diunggah dari LE-DOCS.
4. Langkah berikutnya dan tenggat (misalnya jadwal konsultasi) tampil di atas.
5. Setiap perubahan status dan tenggat mengirim notifikasi.

## Catatan

Advokat yang memberi nasihat hukum dan mewakili pengguna. Le-Insure menangani triase, pencocokan, jadwal, dokumen, dan status.
