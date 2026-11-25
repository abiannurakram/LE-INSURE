# UF1: Alur pemesanan advokat

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

1. Member membuka Find an Advocate (dari menu atau hasil triase/contract review).
2. Menyaring berdasarkan bidang dan kota.
3. Kartu advokat: nama, bidang, kota, kanal (daring/tatap muka), honorarium per sesi, status terverifikasi.
4. Book consultation: total = honorarium advokat + biaya platform Rp25.000, lalu pilih slot waktu.
5. Konfirmasi: notifikasi janji dibuat dan muncul di kartu Coming up.
6. Member Paket Karyawan: 1 konsultasi 30 menit per tahun sudah tercakup.

## Catatan

Advokat yang memberi nasihat hukum. Honorarium advokat diteruskan utuh. Nama advokat di prototipe adalah contoh.
