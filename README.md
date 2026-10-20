# Jelajah Aman - Aplikasi Informasi Cuaca & Kualitas Udara

Aplikasi *mobile* berbasis React Native dan Expo untuk memantau informasi cuaca serta kualitas udara berbasis lokasi dan pencarian kota dengan pendekatan *Offline-First*.

---

## ⛅ Penjelasan Status Data Cuaca

Aplikasi ini menerapkan strategi *Offline-First* menggunakan SQLite untuk menyimpan riwayat pencarian data cuaca. Berikut adalah penjelasan mengenai status data cuaca yang ditampilkan kepada pengguna:

* **Cache Segar**: Data dibaca langsung dari SQLite lokal karena usianya masih di bawah 30 menit (di bawah batas TTL / *Time To Live*). Aplikasi tidak perlu melakukan permintaan jaringan baru ke API.
* **Cache Basi**: Data lokal digunakan sebagai cadangan darurat saat koneksi internet terputus, meskipun usia data sudah melebihi 30 menit.
* **First-run Offline**: Kondisi di mana internet terputus dan aplikasi belum memiliki riwayat simpanan data sama sekali untuk kota tersebut. Aplikasi akan menampilkan pesan peringatan dan opsi untuk mencoba lagi.

> **Transparansi Informasi**: Label status ini sangat penting untuk transparansi informasi keakuratan data kepada pengguna, sehingga pengguna dapat mengetahui apakah data cuaca yang mereka lihat merupakan data paling terkini atau data cadangan dari penyimpanan lokal.

---

## 🛠️ Fitur Utama

- **Pencarian Kota Hybrid**: Dukungan pencarian online (Open-Meteo API) serta pencarian offline dari dataset lokal dan daftar favorit.
- **SQLite Offline-First Caching**: Penyimpanan data cuaca dan indeks kualitas udara secara otomatis di database lokal.
- **Manajemen Favorit**: Menyimpan daftar kota favorit menggunakan `AsyncStorage`.
- **Deteksi Lokasi GPS**: Mengambil data cuaca berdasarkan koordinat lokasi perangkat pengguna saat ini.
- **Pembaruan Skema Migrasi (v2)**: Pengelolaan versi database SQLite berbasis `PRAGMA user_version`.