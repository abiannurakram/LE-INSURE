# UF1: Alur LE-LEGACY

```mermaid
flowchart TD
    S([Legacy Planning]) --> KY{e-KYC sudah lolos?}
    KY -- Belum --> K[Selesaikan e-KYC di Profile]
    K --> AM
    KY -- Sudah --> AM[Asset mapping]
    AM --> DM[Document mapping ke LE-DOCS]
    DM --> BN[Catat penerima manfaat]
    BN --> EA[Atur akses darurat + masa tunggu]
    EA --> NR{Ingin membuat wasiat/akta?}
    NR -- Ya --> NO[Request referral ke notaris mitra]
    NO --> NN[Notifikasi rujukan, notaris menghubungi]
    NN --> NW[Wasiat/akta dibuat di hadapan notaris]
    NR -- Tidak --> END([Peta legacy tersimpan])
```

## Langkah

1. Member membuka Legacy Planning; bila e-KYC belum lolos, diarahkan menyelesaikannya.
2. Asset mapping: catat properti, rekening, polis, barang berharga, beserta lokasi dokumennya.
3. Document mapping: tautkan aset ke dokumen LE-DOCS; tampilkan dokumen yang belum ada.
4. Catat penerima manfaat dan hubungannya.
5. Atur akses darurat: kontak tepercaya + masa tunggu yang bisa ditolak pemilik.
6. Opsional: minta rujukan notaris mitra.

## Catatan

Teks tetap di setiap layar: LE-LEGACY bukan pengganti wasiat. LE-LEGACY hanya mencatat keberadaan dan lokasi dokumen.
