# DT1: Data Legal Protection Plan

| Field | Tipe | Aturan |
|---|---|---|
| daftar tunggu: pengguna | relasi | Unik per pengguna |
| daftar tunggu: tanggal bergabung | tanggal-waktu | Otomatis; terhapus bila keluar |
| polis (Fase 2) | relasi | Nomor polis, penanggung, premi, batas, masa tunggu; dari perusahaan asuransi |
| klaim (Fase 2) | relasi | Belum dibangun; keputusan oleh perusahaan asuransi |

MVP hanya menyimpan daftar tunggu. Angka polis ilustratif diambil dari `prd.md` §6.
