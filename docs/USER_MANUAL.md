# 📖 User Manual (Panduan Pengguna)

## Aplikasi Manajemen Inventori

> **Versi**: 1.0  
> **Tanggal Update**: Desember 2024

---

## 📋 Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Halaman Login (Masuk)](#2-halaman-login-masuk)
3. [Dashboard (Beranda)](#3-dashboard-beranda)
4. [Manajemen Inventori (Stok)](#4-manajemen-inventori-stok)
5. [Manajemen Supplier (Pemasok)](#5-manajemen-supplier-pemasok)
6. [Transaksi Stok Masuk](#6-transaksi-stok-masuk)
7. [Transaksi Stok Keluar](#7-transaksi-stok-keluar)
8. [Pengaturan Akun](#8-pengaturan-akun)
9. [FAQ & Troubleshooting](#9-faq--troubleshooting)

---

## 1. Pendahuluan

### 1.1 Tentang Aplikasi

Aplikasi **Manajemen Inventori** adalah sistem berbasis web yang dirancang untuk membantu bisnis dalam mengelola:

- **Stok barang/bahan** dengan pelacakan real-time
- **Data supplier** untuk koordinasi pembelian
- **Transaksi masuk dan keluar** dengan pencatatan lengkap
- **Notifikasi stok rendah** untuk mencegah kehabisan bahan

### 1.2 Hak Akses (Role)

Aplikasi ini memiliki dua role pengguna:

| Role | Deskripsi | Hak Akses |
|------|-----------|-----------|
| **OWNER** | Pemilik/Admin | Akses penuh ke semua fitur termasuk hapus data dan manajemen pengguna |
| **PEGAWAI** | Staf/Karyawan | Akses terbatas untuk operasional harian (lihat dan tambah data) |

### 1.3 Tampilan Aplikasi - Overview

<!-- SCREENSHOT SPACE: Masukkan screenshot overview/landing page aplikasi -->
> **📸 Screenshot**: [Masukkan screenshot tampilan utama aplikasi di sini]

---

## 2. Halaman Login (Masuk)

### 2.1 Cara Login

1. Buka aplikasi melalui browser
2. Masukkan **Email** yang terdaftar
3. Masukkan **Password**
4. Klik tombol **"Sign In"** / **"Masuk"**

### 2.2 Tampilan Halaman Login

<!-- SCREENSHOT SPACE: Masukkan screenshot halaman login -->
> **📸 Screenshot**: [Masukkan screenshot halaman login di sini]

### 2.3 Catatan Penting

- Pastikan email dan password yang dimasukkan benar
- Jika lupa password, hubungi administrator (OWNER)
- Setelah login berhasil, Anda akan dialihkan ke halaman **Dashboard**

---

## 3. Dashboard (Beranda)

### 3.1 Deskripsi

Dashboard adalah halaman utama yang menampilkan ringkasan informasi penting tentang inventori Anda.

### 3.2 Komponen Dashboard

#### A. Metric Cards (Kartu Metrik)

Menampilkan informasi ringkasan:

| Metrik | Deskripsi |
|--------|-----------|
| **Total Produk** | Jumlah jenis produk/bahan yang terdaftar |
| **Total Nilai Stok** | Estimasi nilai rupiah dari seluruh stok |
| **Stok Rendah** | Jumlah produk yang mendekati batas minimum |
| **Produk Habis** | Jumlah produk dengan stok 0 |

<!-- SCREENSHOT SPACE: Masukkan screenshot metric cards -->
> **📸 Screenshot**: [Masukkan screenshot kartu metrik dashboard di sini]

#### B. Grafik Stok Masuk vs Stok Keluar

- Menampilkan perbandingan aktivitas transaksi bulanan
- Filter berdasarkan tahun tersedia
- Membantu analisis tren penggunaan stok

<!-- SCREENSHOT SPACE: Masukkan screenshot grafik -->
> **📸 Screenshot**: [Masukkan screenshot grafik Stock In vs Stock Out di sini]

#### C. Tabel Level Stok

- Daftar produk dengan status stok
- Indikator warna:
  - 🟢 **Hijau**: Stok Aman
  - 🟡 **Kuning**: Stok Rendah (Low Stock)
  - 🔴 **Merah**: Kritis / Habis

<!-- SCREENSHOT SPACE: Masukkan screenshot tabel level stok -->
> **📸 Screenshot**: [Masukkan screenshot tabel level stok di sini]

#### D. Top 5 Produk Paling Sering Digunakan

- Menampilkan produk dengan volume penggunaan tertinggi
- Berdasarkan data 30 hari terakhir

<!-- SCREENSHOT SPACE: Masukkan screenshot top products -->
> **📸 Screenshot**: [Masukkan screenshot top products chart di sini]

---

## 4. Manajemen Inventori (Stok)

### 4.1 Mengakses Halaman Inventori

1. Klik menu **"Inventory"** pada sidebar
2. Halaman daftar inventori akan ditampilkan

<!-- SCREENSHOT SPACE: Masukkan screenshot halaman inventori -->
> **📸 Screenshot**: [Masukkan screenshot halaman daftar inventori di sini]

### 4.2 Melihat Daftar Stok

Tabel inventori menampilkan:

| Kolom | Deskripsi |
|-------|-----------|
| **Nama Stok** | Nama produk/bahan |
| **Kategori** | Kategori produk (Daging, Sayuran, dll) |
| **Stok** | Jumlah stok tersedia saat ini |
| **Satuan** | Unit satuan (gram, ml, pcs) |
| **Harga Beli** | Harga per satuan |
| **Supplier** | Nama pemasok |
| **Aksi** | Tombol untuk View, Edit, Delete |

### 4.3 Pencarian & Filter

- Gunakan **Search Box** untuk mencari produk berdasarkan nama
- Filter tersedia untuk menyaring berdasarkan kategori

<!-- SCREENSHOT SPACE: Masukkan screenshot fitur search -->
> **📸 Screenshot**: [Masukkan screenshot fitur pencarian di sini]

### 4.4 Menambah Produk Baru

1. Klik tombol **"+ Add Stock"** atau **"+ Tambah Stok"**
2. Isi formulir dengan data:
   - **Nama Stok** (wajib)
   - **Kategori** (pilih dari dropdown)
   - **Satuan** (GRAM / ML / PCS)
   - **Harga Beli** per satuan
   - **Jumlah Awal** stok
   - **Stok Minimal** (batas low stock)
   - **Supplier** (opsional)
3. Klik **"Simpan"** / **"Save"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form tambah stok -->
> **📸 Screenshot**: [Masukkan screenshot form tambah produk di sini]

### 4.5 Melihat Detail Produk

1. Klik ikon **👁 (View)** pada baris produk
2. Modal detail akan menampilkan informasi lengkap

<!-- SCREENSHOT SPACE: Masukkan screenshot detail produk -->
> **📸 Screenshot**: [Masukkan screenshot modal detail produk di sini]

### 4.6 Mengedit Produk

1. Klik ikon **✏️ (Edit)** pada baris produk
2. Ubah data yang diinginkan pada formulir
3. Klik **"Simpan Perubahan"** / **"Update"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form edit produk -->
> **📸 Screenshot**: [Masukkan screenshot form edit produk di sini]

### 4.7 Menghapus Produk

> ⚠️ **Perhatian**: Fitur hapus hanya tersedia untuk role **OWNER**

1. Klik ikon **🗑️ (Delete)** pada baris produk
2. Konfirmasi penghapusan pada dialog yang muncul
3. Data akan dihapus secara permanen

<!-- SCREENSHOT SPACE: Masukkan screenshot konfirmasi hapus -->
> **📸 Screenshot**: [Masukkan screenshot dialog konfirmasi hapus di sini]

---

## 5. Manajemen Supplier (Pemasok)

### 5.1 Mengakses Halaman Supplier

1. Klik menu **"Supplier"** pada sidebar
2. Halaman daftar supplier akan ditampilkan

<!-- SCREENSHOT SPACE: Masukkan screenshot halaman supplier -->
> **📸 Screenshot**: [Masukkan screenshot halaman daftar supplier di sini]

### 5.2 Daftar Supplier

Tabel supplier menampilkan:

| Kolom | Deskripsi |
|-------|-----------|
| **Nama Supplier** | Nama pemasok |
| **Kategori** | Jenis produk yang dipasok |
| **WhatsApp** | Nomor kontak WhatsApp |
| **Alamat** | Alamat lengkap supplier |
| **Status** | ACTIVE / INACTIVE |
| **Aksi** | Tombol View, Edit, Delete |

### 5.3 Menambah Supplier Baru

1. Klik tombol **"+ Add Supplier"** atau **"+ Tambah Supplier"**
2. Isi formulir dengan data:
   - **Nama Supplier** (wajib)
   - **Kategori**
   - **Nomor WhatsApp**
   - **Alamat**
3. Klik **"Simpan"** / **"Save"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form tambah supplier -->
> **📸 Screenshot**: [Masukkan screenshot form tambah supplier di sini]

### 5.4 Mengedit Supplier

1. Klik ikon **✏️ (Edit)** pada baris supplier
2. Ubah data yang diinginkan
3. Klik **"Simpan Perubahan"**

### 5.5 Menghapus Supplier

> ⚠️ **Perhatian**: Pastikan tidak ada produk yang terhubung dengan supplier sebelum menghapus

1. Klik ikon **🗑️ (Delete)**
2. Konfirmasi penghapusan

---

## 6. Transaksi Stok Masuk

### 6.1 Deskripsi

Transaksi stok masuk mencatat pembelian atau penambahan stok baru ke inventori.

### 6.2 Mengakses Menu Transaksi

1. Klik menu **"Transactions"** pada sidebar
2. Pilih submenu **"Stock In"** atau akses halaman utama transaksi

<!-- SCREENSHOT SPACE: Masukkan screenshot halaman transaksi stok masuk -->
> **📸 Screenshot**: [Masukkan screenshot halaman transaksi stok masuk di sini]

### 6.3 Melihat Daftar Transaksi

Tabel menampilkan:

| Kolom | Deskripsi |
|-------|-----------|
| **Nama Transaksi** | Keterangan transaksi |
| **Produk** | Produk yang ditambah stoknya |
| **Tanggal** | Tanggal transaksi |
| **Jumlah** | Jumlah yang ditambahkan |
| **Total Harga** | Total biaya pembelian |
| **Metode Bayar** | CASH / TRANSFER / OTHER |
| **Status** | PENDING / COMPLETED / CANCELLED |

### 6.4 Menambah Transaksi Stok Masuk

1. Klik tombol **"+ New Transaction"**
2. Isi formulir:
   - **Nama Transaksi** (wajib)
   - **Pilih Produk** (dropdown)
   - **Supplier** (opsional)
   - **Tanggal Transaksi**
   - **Jumlah** stok yang masuk
   - **Total Harga**
   - **Metode Pembayaran**
   - **Status Transaksi**
3. Klik **"Simpan"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form transaksi masuk -->
> **📸 Screenshot**: [Masukkan screenshot form transaksi stok masuk di sini]

### 6.5 Efek pada Stok

> ✅ **Otomatis**: Saat transaksi dengan status **COMPLETED** disimpan, jumlah stok produk akan **bertambah** secara otomatis

---

## 7. Transaksi Stok Keluar

### 7.1 Deskripsi

Transaksi stok keluar mencatat penggunaan, penjualan, atau pengurangan stok.

### 7.2 Mengakses Menu

1. Klik menu **"Transactions"** pada sidebar
2. Pilih submenu **"Stock Out"** atau **"Sales"**

<!-- SCREENSHOT SPACE: Masukkan screenshot halaman transaksi stok keluar -->
> **📸 Screenshot**: [Masukkan screenshot halaman transaksi stok keluar di sini]

### 7.3 Tipe Transaksi Keluar

| Tipe | Deskripsi |
|------|-----------|
| **RESEP** | Penggunaan untuk produksi/menu |
| **RUSAK** | Barang rusak/tidak layak |
| **EXP** | Barang kadaluarsa |
| **LAINNYA** | Kategori lain-lain |

### 7.4 Menambah Transaksi Stok Keluar

1. Klik **"+ New Transaction"**
2. Isi formulir:
   - **Nama Transaksi**
   - **Pilih Produk**
   - **Tipe Keluar** (RESEP/RUSAK/EXP/LAINNYA)
   - **Tanggal**
   - **Jumlah** yang keluar
   - **Catatan** (opsional)
3. Klik **"Simpan"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form transaksi keluar -->
> **📸 Screenshot**: [Masukkan screenshot form transaksi stok keluar di sini]

### 7.5 Efek pada Stok

> ✅ **Otomatis**: Saat transaksi disimpan, jumlah stok produk akan **berkurang** secara otomatis

---

## 8. Pengaturan Akun

### 8.1 Mengakses Pengaturan

1. Klik menu **"Settings"** pada sidebar
2. Halaman pengaturan akun akan ditampilkan

<!-- SCREENSHOT SPACE: Masukkan screenshot halaman settings -->
> **📸 Screenshot**: [Masukkan screenshot halaman pengaturan di sini]

### 8.2 Mengubah Profil

1. Di bagian **Account Profile**, ubah:
   - **Nama**
   - **Username**
   - **Email**
2. Klik **"Save Changes"** / **"Simpan"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form profil -->
> **📸 Screenshot**: [Masukkan screenshot form ubah profil di sini]

### 8.3 Mengubah Password

1. Di bagian **Change Password**:
   - Masukkan **Password Lama**
   - Masukkan **Password Baru**
   - Konfirmasi **Password Baru**
2. Klik **"Update Password"**

<!-- SCREENSHOT SPACE: Masukkan screenshot form password -->
> **📸 Screenshot**: [Masukkan screenshot form ubah password di sini]

### 8.4 Logout (Keluar)

1. Klik tombol **Logout** pada bagian bawah halaman settings
2. Atau klik menu profil dan pilih **"Sign Out"**

---

## 9. FAQ & Troubleshooting

### 9.1 Pertanyaan Umum

#### Q: Bagaimana cara reset password?
**A:** Hubungi administrator (OWNER) untuk mereset password akun Anda.

#### Q: Mengapa saya tidak bisa menghapus produk?
**A:** Fitur hapus hanya tersedia untuk role OWNER. Hubungi administrator.

#### Q: Stok tidak terupdate setelah transaksi?
**A:** Pastikan status transaksi adalah **COMPLETED**. Transaksi dengan status PENDING atau CANCELLED tidak akan mempengaruhi stok.

#### Q: Bagaimana cara menambah user baru?
**A:** Saat ini penambahan user dilakukan oleh administrator melalui sistem. Hubungi OWNER.

### 9.2 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Tidak bisa login | Periksa email dan password, pastikan koneksi internet stabil |
| Halaman tidak memuat | Refresh browser (F5) atau clear cache |
| Data tidak tersimpan | Pastikan semua field wajib terisi dengan benar |
| Error pada form | Periksa format data (contoh: harga harus angka positif) |

### 9.3 Kontak Support

Jika mengalami masalah yang tidak dapat diselesaikan:

- **Email**: [Masukkan email support]
- **WhatsApp**: [Masukkan nomor WA support]

---

## 📌 Catatan Penutup

Dokumentasi ini akan terus diperbarui seiring dengan pengembangan fitur baru. Selalu pastikan Anda menggunakan versi terbaru dari panduan ini.

**Terakhir diperbarui**: Desember 2024

---

*© 2024 - Inventory Management System*
