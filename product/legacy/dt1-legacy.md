# DT1: Data LE-LEGACY

| Field | Tipe | Aturan |
|---|---|---|
| aset: jenis | pilihan | Properti, rekening, polis, kendaraan, barang berharga, lainnya |
| aset: nama/keterangan | teks | Wajib |
| aset: lokasi dokumen asli | teks | Opsional |
| aset: dokumen terkait | relasi | Ke dokumen LE-DOCS |
| penerima manfaat: nama | teks | Wajib |
| penerima manfaat: hubungan | pilihan | Pasangan, anak, orang tua, saudara, lainnya |
| kontak darurat: nama, email, telepon | teks | Wajib saat diatur |
| kontak darurat: masa tunggu | angka (hari) | Akses terbuka setelah masa tunggu kecuali pemilik menolak |
| rujukan notaris | relasi | Notaris mitra + status (diminta, dihubungi, selesai) |

Data aset dan penerima manfaat bersifat sensitif: simpan terenkripsi.
