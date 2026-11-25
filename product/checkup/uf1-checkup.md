# UF1: Alur Legal Check-up

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

1. Member membuka Legal Check-up.
2. Memilih situasi: menyewa, bekerja, jual-beli daring, punya tanah/kendaraan, menikah, punya anak.
3. Sistem menampilkan daftar periksa sesuai situasi, tiap butir berstatus Siap atau Belum.
4. Member mencentang butir; progres diperbarui.
5. Ringkasan menampilkan langkah berikutnya (misalnya unggah kontrak sewa ke LE-DOCS, periksa kontrak dengan AI).
6. Semua selesai: pesan "Review again when your situation changes."
