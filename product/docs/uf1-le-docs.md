# UF1: Alur LE-DOCS

```mermaid
flowchart TD
    O([LE-DOCS]) --> U[Unggah + kategori + tanggal kedaluwarsa]
    U --> L[Daftar dokumen]
    L --> S[Cari / filter / unduh]
    L --> R[Pengingat kedaluwarsa -> notifications]
    L --> B{Bagikan?}
    B -- Ya --> P[Pilih penerima + tanggal berakhir]
    P --> V[Cabut kapan saja di account/privacy]
```

## Langkah

1. Member membuka LE-DOCS dan melihat kuota (1 GB Basic, 20 GB Plus).
2. Unggah dokumen dan pilih kategori: Personal, Family, Property & Assets, Contracts, Insurance; isi tanggal kedaluwarsa bila ada.
3. Cari dan saring dokumen; unduh per dokumen.
4. Pengingat kedaluwarsa muncul di LE-DOCS dan notifikasi.
5. Bagikan dokumen ke advokat/notaris dengan tanggal berakhir; akses bisa dicabut di Privacy.
