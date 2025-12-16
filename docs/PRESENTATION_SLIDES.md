# 🚀 StockWise - Inventory Management System

> **Sistem Manajemen Inventori Modern untuk Bisnis Anda**

---

## 📌 Slide 1: Cover / Judul

# StockWise
### Smart Inventory Management System

**Kelola Stok dengan Lebih Cerdas, Cepat, dan Efisien**

🌐 Berbasis Web | ⚡ Real-time | 🔐 Aman

---

**Tech Stack:**
`Next.js` • `TypeScript` • `Prisma` • `PostgreSQL` • `NextAuth` • `Tailwind CSS`

---

## 📌 Slide 2: Masalah & Solusi

### ❌ Masalah yang Sering Terjadi

| Masalah | Dampak |
|---------|--------|
| Pencatatan stok manual | Data tidak akurat & rawan salah |
| Tidak tahu kapan stok habis | Operasional terganggu |
| Sulit melacak supplier | Pembelian tidak terorganisir |
| Laporan tidak real-time | Keputusan bisnis lambat |

---

### ✅ Solusi: StockWise

> **Satu platform untuk semua kebutuhan manajemen inventori Anda!**

- 📊 **Dashboard Real-time** - Pantau semua metrik penting dalam sekejap
- 🔔 **Notifikasi Otomatis** - Peringatan saat stok menipis
- 📈 **Laporan Visual** - Grafik dan analitik yang mudah dipahami
- 🔐 **Akses Terkontrol** - Sistem role untuk keamanan data

---

## 📌 Slide 3: Fitur Utama

### ⭐ Fitur Unggulan StockWise

#### 1. 📊 Dashboard Interaktif
- Metric cards: Total Produk, Nilai Stok, Stok Rendah, Stok Habis
- Grafik Stok Masuk vs Keluar (bulanan)
- Top 5 Produk Paling Sering Digunakan
- Tabel Level Stok dengan indikator warna

#### 2. 📦 Manajemen Inventori
- CRUD produk lengkap (Create, Read, Update, Delete)
- Kategori produk: Daging, Sayuran, Bumbu, dll
- Satuan fleksibel: GRAM, ML, PCS
- Batas minimum stok untuk peringatan otomatis

#### 3. 🏢 Manajemen Supplier
- Database pemasok lengkap
- Integrasi WhatsApp untuk komunikasi cepat
- Status aktif/nonaktif supplier
- Kategorisasi berdasarkan jenis produk

#### 4. 🔄 Transaksi Otomatis
- **Stock In**: Pembelian & penambahan stok
- **Stock Out**: Penggunaan, rusak, expired
- Update stok otomatis saat transaksi selesai
- Riwayat transaksi lengkap

---

## 📌 Slide 4: Tampilan Aplikasi

### 🖥️ Preview Interface

#### Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  📦 156        💰 Rp 45M      ⚠️ 12        🔴 3        │
│  Total Produk  Nilai Stok    Stok Rendah  Stok Habis  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📈 Grafik Stock In vs Stock Out                       │
│  ████ ██████ ████ ███████ █████ ████████              │
│  Jan  Feb    Mar  Apr     Mei   Jun                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📋 Tabel Level Stok                                   │
│  🟢 Daging Ayam   - 500 gram  - Aman                  │
│  🟡 Bawang Merah  - 150 gram  - Low Stock             │
│  🔴 Cabai Rawit   - 0 gram    - Habis                 │
└─────────────────────────────────────────────────────────┘
```

#### Inventory & Supplier
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search...                    [+ Tambah Produk]     │
├─────────────────────────────────────────────────────────┤
│  Nama          Kategori    Stok     Harga    Aksi     │
│  ───────────────────────────────────────────────────── │
│  Daging Sapi   Daging      25 kg    Rp 120k  👁️ ✏️ 🗑️ │
│  Tomat         Sayuran     50 kg    Rp 15k   👁️ ✏️ 🗑️ │
│  Garam         Bumbu       100 pcs  Rp 5k    👁️ ✏️ 🗑️ │
└─────────────────────────────────────────────────────────┘
```

---

## 📌 Slide 5: Sistem Role & Keamanan

### 🔐 Akses Berbasis Peran

| Fitur | 👑 OWNER | 👤 PEGAWAI |
|-------|:--------:|:----------:|
| Lihat Dashboard | ✅ | ✅ |
| Lihat Inventori | ✅ | ✅ |
| Tambah Produk | ✅ | ✅ |
| Edit Produk | ✅ | ✅ |
| **Hapus Produk** | ✅ | ❌ |
| Catat Transaksi | ✅ | ✅ |
| **Hapus Transaksi** | ✅ | ❌ |
| Kelola Supplier | ✅ | ✅ |
| **Manajemen User** | ✅ | ❌ |

---

### 🛡️ Keamanan Terjamin

- 🔑 **NextAuth.js** - Autentikasi berbasis credential yang aman
- 🔒 **Session Management** - Token JWT terenkripsi
- 👥 **Role-based Access Control** - Pembatasan akses sesuai peran
- 📝 **Audit Trail** - Pencatatan aktivitas pengguna

---

## 📌 Slide 6: Tech Stack

### 💻 Teknologi Modern

| Layer | Teknologi | Keunggulan |
|-------|-----------|------------|
| **Frontend** | Next.js 15 | App Router, Server Components, Fast Refresh |
| **Styling** | Tailwind CSS | Utility-first, Responsive Design |
| **Language** | TypeScript | Type-safe, Better DX |
| **Database** | PostgreSQL | Reliable, ACID Compliant |
| **ORM** | Prisma | Type-safe queries, Easy migrations |
| **Auth** | NextAuth.js | Secure, Flexible authentication |
| **Charts** | Recharts | Beautiful data visualization |
| **Testing** | Playwright | End-to-end testing |

---

### 🏗️ Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                     🌐 Browser                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Next.js Application                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages/    │  │   Server    │  │    API      │    │
│  │   UI        │  │   Actions   │  │   Routes    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Prisma ORM                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📌 Slide 7: Keunggulan Kompetitif

### 🏆 Mengapa Memilih StockWise?

| Aspek | StockWise | Kompetitor |
|-------|:---------:|:----------:|
| **Real-time Updates** | ✅ Instan | ⏳ Delay |
| **Modern UI/UX** | ✅ Intuitif | 😐 Kuno |
| **Mobile Responsive** | ✅ Semua device | ❌ Desktop only |
| **Multi-role** | ✅ OWNER & PEGAWAI | ❌ Single user |
| **Notifikasi Stok** | ✅ Otomatis | ❌ Manual check |
| **Open Source** | ✅ Customizable | ❌ Proprietary |

---

### 💡 Value Proposition

> **"Fokus pada bisnis Anda, biarkan StockWise yang mengurus inventori!"**

1. ⏱️ **Hemat Waktu** - Otomatisasi pencatatan stok
2. 💰 **Kurangi Kerugian** - Cegah kehabisan stok & expired
3. 📊 **Keputusan Tepat** - Data real-time untuk analisis
4. 🔄 **Skalabel** - Tumbuh bersama bisnis Anda

---

## 📌 Slide 8: Demo Flow

### 🎬 Alur Penggunaan

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  LOGIN   │ ─► │DASHBOARD │ ─► │INVENTORY │ ─► │TRANSAKSI │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │                │               │
     ▼               ▼                ▼               ▼
  Masukkan      Lihat metrik     Kelola produk   Catat stok
  credential    & grafik         & supplier      masuk/keluar
```

---

### 📋 Skenario Penggunaan

**Skenario 1: Stok Masuk (Pembelian)**
1. Login sebagai OWNER/PEGAWAI
2. Buka menu Transactions → Stock In
3. Pilih produk, masukkan jumlah & harga
4. Simpan → Stok otomatis bertambah ✅

**Skenario 2: Stok Keluar (Penggunaan)**
1. Buka menu Transactions → Stock Out
2. Pilih produk, masukkan jumlah
3. Pilih tipe: RESEP, RUSAK, EXP, LAINNYA
4. Simpan → Stok otomatis berkurang ✅

**Skenario 3: Alert Stok Rendah**
1. Dashboard menampilkan warning ⚠️
2. Klik untuk lihat detail produk
3. Hubungi supplier via WhatsApp langsung
4. Catat pembelian baru √

---

## 📌 Slide 9: Instalasi & Deployment

### 🛠️ Quick Start

```bash
# Clone repository
git clone <repository-url>
cd NextJS-inventory-management-app

# Install dependencies
npm install

# Setup database
npx prisma migrate deploy
npx prisma db seed

# Run development server
npm run dev
```

---

### ☁️ Deployment Ready

| Platform | Status |
|----------|:------:|
| Vercel | ✅ Ready |
| Docker | ✅ Supported |
| Railway | ✅ Compatible |
| Self-hosted | ✅ Available |

---

## 📌 Slide 10: Penutup

# Terima Kasih! 🙏

---

### 📞 Kontak & Link

| Resource | Link |
|----------|------|
| 📖 Dokumentasi | `docs/USER_MANUAL.md` |
| 🔧 Instalasi | `docs/INSTALLATION.md` |
| 💻 Source Code | GitHub Repository |

---

### 👨‍💻 Tim Pengembang

**PADSI 2024**

> *"Building the future of inventory management, one commit at a time."*

---

## 📎 Lampiran: Screenshot Placeholder

> **Catatan**: Tambahkan screenshot aplikasi yang sebenarnya untuk presentasi final

| Slide | Screenshot yang Dibutuhkan |
|-------|---------------------------|
| Slide 4 | Dashboard, Halaman Inventory, Halaman Supplier |
| Slide 5 | Halaman Login, Menu Settings |
| Slide 8 | Form Stock In, Form Stock Out |

---

*© 2024 StockWise - Inventory Management System*
