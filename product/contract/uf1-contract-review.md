# UF1: Alur AI Contract Review

```mermaid
flowchart TD
    Q([Readiness quiz di Home]) --> SC[Skor dan celah]
    SC --> R[Register / Login]
    R --> CU[Legal Check-up: pilih situasi, centang daftar periksa]
    CU --> CR[AI Contract Review: unggah PDF/foto kontrak]
    CR --> FL[Ringkasan + klausul ditandai, label bukan nasihat hukum]
    FL --> SV[Simpan ke LE-DOCS kategori Contracts]
    FL --> AD{Ada klausul janggal?}
    AD -- Ya --> FA[Find an Advocate, lanjut F5]
    AD -- Tidak --> SV
    SV --> RM[Pengingat masa berlaku di Notifications]
```

## Langkah

1. Member mengunggah PDF/foto kontrak atau memilih dari LE-DOCS, lalu memilih jenis (sewa, kerja, pribadi).
2. Sistem menampilkan ringkasan (para pihak, jangka waktu, nilai) dan klausul yang ditandai (Review/Info) dengan penjelasan bahasa awam.
3. Label tetap: AI hanya menandai klausul, bukan nasihat hukum.
4. Member menyimpan ke LE-DOCS kategori Contracts, atau lanjut ke Find an Advocate bila ada klausul janggal.
