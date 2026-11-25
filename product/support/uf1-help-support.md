# UF1: Alur bantuan

```mermaid
flowchart TD
    S([Tombol Help melayang]) --> HC[Help Center: cari / pilih topik]
    HC --> FQ{Jawaban ditemukan?}
    FQ -- Ya --> END([Selesai])
    FQ -- Tidak --> CH[Asisten chat berbasis FAQ]
    CH --> FQ2{Terjawab?}
    FQ2 -- Ya --> END
    FQ2 -- Tidak --> CS[Contact Support]
    CS --> CN{Kanal}
    CN --> LC[Live chat]
    CN --> EM[Email]
    CN --> PH[Telepon]
    CN --> TK[Formulir tiket, nomor LI-T… langsung tampil]
```

## Langkah

1. Tombol Help melayang membuka Help Center: pencarian, 6 topik, FAQ.
2. Belum terjawab: asisten chat berbasis FAQ.
3. Masih belum: Contact Support dengan kanal live chat, email, telepon, atau formulir tiket.
4. Tiket langsung mendapat nomor (format LI-T…).
5. Keluhan klaim diarahkan ke perusahaan asuransi dulu, lalu layanan pengaduan konsumen OJK.
