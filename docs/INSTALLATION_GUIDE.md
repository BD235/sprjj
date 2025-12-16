# 🚀 Panduan Instalasi (Installation Guide)

## Aplikasi Manajemen Inventori

> **Versi**: 1.0  
> **Tanggal Update**: Desember 2024

---

## 📋 Daftar Isi

1. [Persyaratan Sistem](#1-persyaratan-sistem)
2. [Instalasi untuk Development](#2-instalasi-untuk-development)
3. [Konfigurasi Environment](#3-konfigurasi-environment)
4. [Setup Database](#4-setup-database)
5. [Menjalankan Aplikasi](#5-menjalankan-aplikasi)
6. [Deployment ke Production](#6-deployment-ke-production)
7. [Troubleshooting Instalasi](#7-troubleshooting-instalasi)

---

## 1. Persyaratan Sistem

### 1.1 Software Requirements

| Software | Versi Minimum | Rekomendasi |
|----------|---------------|-------------|
| **Node.js** | 18.x | 20.x LTS |
| **npm** | 9.x | 10.x |
| **PostgreSQL** | 13.x | 15.x atau 16.x |
| **Git** | 2.x | Versi terbaru |

### 1.2 Mengecek Versi Software

Buka terminal dan jalankan perintah berikut:

```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version

# Cek versi PostgreSQL
psql --version

# Cek versi Git
git --version
```

### 1.3 Instalasi Node.js (Jika Belum Ada)

#### Windows
1. Download installer dari [nodejs.org](https://nodejs.org/)
2. Jalankan installer dan ikuti wizard
3. Restart terminal setelah instalasi

#### macOS
```bash
# Menggunakan Homebrew
brew install node
```

#### Ubuntu/Debian Linux
```bash
# Update package manager
sudo apt update

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.4 Instalasi PostgreSQL (Jika Belum Ada)

#### Windows
1. Download installer dari [postgresql.org](https://www.postgresql.org/download/windows/)
2. Jalankan installer, catat password untuk user `postgres`
3. Setelah selesai, PostgreSQL akan berjalan sebagai service

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian Linux
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 2. Instalasi untuk Development

### 2.1 Clone Repository

```bash
# Clone repository ke folder lokal
git clone <repository-url> inventory-app

# Masuk ke direktori project
cd inventory-app
```

<!-- SCREENSHOT SPACE: Masukkan screenshot proses clone -->
> **📸 Screenshot**: [Masukkan screenshot proses git clone di sini]

### 2.2 Install Dependencies

```bash
# Install semua dependencies
npm install
```

Proses ini akan menginstall semua package yang tercantum di `package.json`, termasuk:

- **Next.js 16** - Framework React
- **Prisma** - ORM untuk database
- **NextAuth** - Authentication
- **TailwindCSS** - Styling
- **Recharts** - Charts/grafik
- **Zod** - Validasi data
- Dan lainnya...

<!-- SCREENSHOT SPACE: Masukkan screenshot npm install -->
> **📸 Screenshot**: [Masukkan screenshot proses npm install di sini]

---

## 3. Konfigurasi Environment

### 3.1 Membuat File Environment

Buat file `.env` di root directory project:

```bash
# Copy dari template (jika ada)
cp .env.example .env

# Atau buat file baru
touch .env
```

### 3.2 Konfigurasi Environment Variables

Edit file `.env` dengan text editor dan isi variabel berikut:

```env
# ================================
# DATABASE
# ================================
# URL koneksi ke PostgreSQL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL="postgresql://postgres:password@localhost:5432/inventory_db"

# ================================
# NEXTAUTH (Authentication)
# ================================
# Secret key untuk enkripsi session (generate string random)
NEXTAUTH_SECRET="your-super-secret-key-generate-random-string"

# URL base aplikasi (untuk development)
NEXTAUTH_URL="http://localhost:3000"

# ================================
# SEED DATA (Opsional)
# ================================
# Data default untuk akun owner saat seeding database
SEED_OWNER_EMAIL="admin@example.com"
SEED_OWNER_PASSWORD="securepassword123"
SEED_OWNER_NAME="Administrator"
SEED_OWNER_USERNAME="admin"
```

### 3.3 Penjelasan Environment Variables

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `DATABASE_URL` | ✅ Ya | URL koneksi PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ Ya | Secret key untuk session. Generate dengan: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ⚠️ Produksi | URL base aplikasi (wajib untuk production) |
| `SEED_OWNER_EMAIL` | ❌ Optional | Email akun owner default |
| `SEED_OWNER_PASSWORD` | ❌ Optional | Password akun owner default |
| `SEED_OWNER_NAME` | ❌ Optional | Nama akun owner |
| `SEED_OWNER_USERNAME` | ❌ Optional | Username akun owner |

### 3.4 Generate NEXTAUTH_SECRET

```bash
# Menggunakan OpenSSL
openssl rand -base64 32

# Atau menggunakan Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Salin output dan paste sebagai nilai `NEXTAUTH_SECRET` di file `.env`.

---

## 4. Setup Database

### 4.1 Membuat Database PostgreSQL

#### Menggunakan psql CLI:

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat database baru
CREATE DATABASE inventory_db;

# Buat user (opsional, jika ingin user terpisah)
CREATE USER inventory_user WITH ENCRYPTED PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;

# Keluar
\q
```

#### Menggunakan pgAdmin (GUI):

1. Buka pgAdmin
2. Klik kanan pada "Databases"
3. Pilih "Create" → "Database"
4. Isi nama database: `inventory_db`
5. Klik "Save"

<!-- SCREENSHOT SPACE: Masukkan screenshot pgAdmin -->
> **📸 Screenshot**: [Masukkan screenshot pembuatan database di pgAdmin di sini]

### 4.2 Menjalankan Migrasi Database

```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi untuk membuat tabel-tabel
npx prisma migrate dev
```

Perintah ini akan:
1. Membaca schema dari `prisma/schema.prisma`
2. Membuat tabel-tabel sesuai schema
3. Menyimpan file migrasi di folder `prisma/migrations`

<!-- SCREENSHOT SPACE: Masukkan screenshot migrasi -->
> **📸 Screenshot**: [Masukkan screenshot proses migrasi di sini]

### 4.3 Seed Data Awal (Opsional)

Untuk mengisi database dengan data default (termasuk akun OWNER):

```bash
npx prisma db seed
```

Perintah ini akan:
1. Membuat role OWNER dan PEGAWAI
2. Membuat akun owner dengan email dari `.env`

> ⚠️ **Catatan**: Seeding bersifat idempotent (aman dijalankan berkali-kali)

### 4.4 Melihat Database dengan Prisma Studio

Untuk melihat dan mengedit data secara visual:

```bash
npx prisma studio
```

Browser akan terbuka di `http://localhost:5555`

<!-- SCREENSHOT SPACE: Masukkan screenshot Prisma Studio -->
> **📸 Screenshot**: [Masukkan screenshot Prisma Studio di sini]

---

## 5. Menjalankan Aplikasi

### 5.1 Mode Development

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

<!-- SCREENSHOT SPACE: Masukkan screenshot npm run dev -->
> **📸 Screenshot**: [Masukkan screenshot terminal npm run dev di sini]

### 5.2 Mode Production (Build & Start)

```bash
# Build aplikasi
npm run build

# Jalankan server production
npm run start
```

### 5.3 Mengakses Aplikasi

1. Buka browser
2. Akses: `http://localhost:3000`
3. Login dengan kredensial yang sudah di-seed

<!-- SCREENSHOT SPACE: Masukkan screenshot aplikasi berjalan -->
> **📸 Screenshot**: [Masukkan screenshot aplikasi yang sudah berjalan di sini]

---

## 6. Deployment ke Production

### 6.1 Deployment Checklist

Sebelum deploy ke production, pastikan:

1. ✅ Semua lint errors sudah diperbaiki
   ```bash
   npm run lint
   ```

2. ✅ Build berhasil tanpa error
   ```bash
   npm run build
   ```

3. ✅ Environment variables sudah dikonfigurasi di platform hosting

4. ✅ Database production sudah tersedia dan ter-migrasi

### 6.2 Deploy ke Vercel (Rekomendasi)

#### Langkah-langkah:

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect ke Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan akun GitHub
   - Klik "New Project"
   - Pilih repository

3. **Konfigurasi Environment Variables**
   
   Di dashboard Vercel, tambahkan:
   - `DATABASE_URL` - URL database production (contoh: Supabase, Railway, Neon)
   - `NEXTAUTH_SECRET` - Secret key yang sama dengan production
   - `NEXTAUTH_URL` - URL deployment Vercel (contoh: `https://your-app.vercel.app`)

4. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai

<!-- SCREENSHOT SPACE: Masukkan screenshot Vercel deployment -->
> **📸 Screenshot**: [Masukkan screenshot proses deployment di Vercel di sini]

### 6.3 Migrasi Database Production

Setelah deploy, jalankan migrasi pada database production:

```bash
# Set DATABASE_URL ke database production
npx prisma migrate deploy

# Seed data jika diperlukan
npx prisma db seed
```

### 6.4 Database Hosting Options

| Provider | Free Tier | Keterangan |
|----------|-----------|------------|
| **Supabase** | ✅ 500MB | PostgreSQL gratis dengan dashboard |
| **Railway** | ✅ $5 credit | Easy setup, auto scaling |
| **Neon** | ✅ 512MB | Serverless PostgreSQL |
| **PlanetScale** | ✅ 5GB | MySQL (perlu adjustment schema) |
| **AWS RDS** | ❌ | Enterprise grade |

### 6.5 Deploy ke Docker (Self-hosted)

#### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/inventory_db
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: inventory_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Menjalankan Docker:

```bash
# Build dan jalankan
docker-compose up -d --build

# Jalankan migrasi
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

---

## 7. Troubleshooting Instalasi

### 7.1 Error Umum dan Solusi

#### ❌ Error: `ECONNREFUSED` saat connect ke database

**Penyebab**: PostgreSQL tidak berjalan atau URL salah

**Solusi**:
```bash
# Cek status PostgreSQL
sudo systemctl status postgresql

# Start jika tidak berjalan
sudo systemctl start postgresql

# Pastikan DATABASE_URL di .env benar
```

---

#### ❌ Error: `Prisma Client has not been generated`

**Penyebab**: Belum generate Prisma Client

**Solusi**:
```bash
npx prisma generate
```

---

#### ❌ Error: `Module not found` saat build

**Penyebab**: Dependencies belum terinstall dengan benar

**Solusi**:
```bash
# Hapus node_modules dan reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

#### ❌ Error: `Port 3000 is already in use`

**Penyebab**: Ada aplikasi lain yang menggunakan port 3000

**Solusi**:
```bash
# Cari proses yang menggunakan port 3000
lsof -i :3000

# Kill proses tersebut
kill -9 <PID>

# Atau jalankan di port lain
npm run dev -- -p 3001
```

---

#### ❌ Error: `relation "xxx" does not exist`

**Penyebab**: Migrasi belum dijalankan

**Solusi**:
```bash
npx prisma migrate dev
```

---

#### ❌ Error: `Invalid `prisma.xxx.findMany()` invocation`

**Penyebab**: Schema berubah tapi Prisma Client belum di-regenerate

**Solusi**:
```bash
npx prisma generate
npm run dev
```

---

### 7.2 Reset Database (Development Only)

Jika ingin reset seluruh database:

```bash
# Reset database dan migrasi
npx prisma migrate reset

# Ini akan:
# 1. Drop semua tabel
# 2. Jalankan ulang semua migrasi
# 3. Jalankan seed
```

> ⚠️ **PERINGATAN**: Jangan lakukan ini di production!

### 7.3 Melihat Log Error

```bash
# Log development
npm run dev 2>&1 | tee app.log

# Log build
npm run build 2>&1 | tee build.log
```

### 7.4 Bantuan Lebih Lanjut

Jika mengalami masalah yang tidak tercakup:

1. Cek dokumentasi teknologi terkait:
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Prisma Documentation](https://www.prisma.io/docs)
   - [NextAuth.js Documentation](https://next-auth.js.org)

2. Hubungi tim pengembang:
   - **Email**: [Masukkan email developer]
   - **GitHub Issues**: [Masukkan link repository]

---

## 📊 Ringkasan Perintah

| Perintah | Deskripsi |
|----------|-----------|
| `npm install` | Install dependencies |
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Cek linting errors |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Jalankan migrasi (dev) |
| `npx prisma migrate deploy` | Jalankan migrasi (prod) |
| `npx prisma db seed` | Seed data awal |
| `npx prisma studio` | Buka GUI database |

---

## 📌 Catatan Penutup

Pastikan untuk selalu:
- Menyimpan file `.env` dengan aman (jangan commit ke repository)
- Menggunakan password yang kuat untuk database production
- Melakukan backup database secara berkala
- Update dependencies secara rutin untuk keamanan

**Terakhir diperbarui**: Desember 2024

---

*© 2024 - Inventory Management System*
