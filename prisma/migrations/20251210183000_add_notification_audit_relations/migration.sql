-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MeasurementUnit" AS ENUM ('GRAM', 'KG', 'ML', 'PCS');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('LOW_STOCK', 'STOCK_OUT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."NotificationSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."users" (
    "id_user" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id_role" TEXT NOT NULL,
    "nama_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id_user" TEXT NOT NULL,
    "id_role" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id_user","id_role")
);

-- CreateTable
CREATE TABLE "public"."stok" (
    "id_stok" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "nama_stok" TEXT NOT NULL,
    "kategori" TEXT,
    "satuan" "public"."MeasurementUnit" NOT NULL DEFAULT 'GRAM',
    "harga_beli" DECIMAL(65,30) NOT NULL,
    "supplier" TEXT,
    "id_pemasok" TEXT,
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "sisa_stok" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stok_pkey" PRIMARY KEY ("id_stok")
);

-- CreateTable
CREATE TABLE "public"."pemasok" (
    "id_pemasok" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "nama_pemasok" TEXT NOT NULL,
    "kategori" TEXT,
    "nomor_wa" TEXT,
    "alamat" TEXT,
    "status" "public"."SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pemasok_pkey" PRIMARY KEY ("id_pemasok")
);

-- CreateTable
CREATE TABLE "public"."transaksi_masuk" (
    "id_transaksi_masuk" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_stok" TEXT NOT NULL,
    "id_pemasok" TEXT,
    "nama_transaksi" TEXT NOT NULL,
    "total_harga" DECIMAL(65,30) NOT NULL,
    "status" "public"."TransactionStatus" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggal_transaksi" TIMESTAMP(3) NOT NULL,
    "metode_pembayaran" "public"."PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_masuk_pkey" PRIMARY KEY ("id_transaksi_masuk")
);

-- CreateTable
CREATE TABLE "public"."transaksi_keluar" (
    "id_transaksi_keluar" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_stok" TEXT NOT NULL,
    "id_menu" TEXT,
    "nama_transaksi" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggal_transaksi" TIMESTAMP(3) NOT NULL,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaksi_keluar_pkey" PRIMARY KEY ("id_transaksi_keluar")
);

-- CreateTable
CREATE TABLE "public"."notifikasi" (
    "id_notifikasi" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_stok" TEXT,
    "id_role_tujuan" TEXT,
    "tipe" "public"."NotificationType" NOT NULL DEFAULT 'LOW_STOCK',
    "tingkat" "public"."NotificationSeverity" NOT NULL DEFAULT 'INFO',
    "pesan" TEXT NOT NULL,
    "sudah_dibaca" BOOLEAN NOT NULL DEFAULT false,
    "dibaca_pada" TIMESTAMP(3),
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id_notifikasi")
);

-- CreateTable
CREATE TABLE "public"."menu" (
    "id_menu" TEXT NOT NULL,
    "kode_menu" TEXT NOT NULL,
    "nama_menu" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id_menu")
);

-- CreateTable
CREATE TABLE "public"."resep" (
    "id_resep" TEXT NOT NULL,
    "id_menu" TEXT NOT NULL,
    "id_stok" TEXT NOT NULL,
    "qty_per_porsi" DECIMAL(65,30) NOT NULL,
    "satuan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resep_pkey" PRIMARY KEY ("id_resep")
);

-- CreateTable
CREATE TABLE "public"."audit_log" (
    "id_audit" TEXT NOT NULL,
    "id_user" TEXT,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "id_entitas" TEXT,
    "data_sebelum" JSONB,
    "data_sesudah" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id_audit")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nama_role_key" ON "public"."roles"("nama_role");

-- CreateIndex
CREATE INDEX "stok_id_user_nama_stok_idx" ON "public"."stok"("id_user", "nama_stok");

-- CreateIndex
CREATE INDEX "stok_id_user_deleted_at_idx" ON "public"."stok"("id_user", "deleted_at");

-- CreateIndex
CREATE INDEX "pemasok_id_user_nama_idx" ON "public"."pemasok"("id_user", "nama_pemasok");

-- CreateIndex
CREATE INDEX "pemasok_id_user_deleted_at_idx" ON "public"."pemasok"("id_user", "deleted_at");

-- CreateIndex
CREATE INDEX "transaksi_masuk_id_stok_idx" ON "public"."transaksi_masuk"("id_stok");

-- CreateIndex
CREATE INDEX "transaksi_masuk_id_user_tanggal_transaksi_idx" ON "public"."transaksi_masuk"("id_user", "tanggal_transaksi");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_stok_idx" ON "public"."transaksi_keluar"("id_stok");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_menu_idx" ON "public"."transaksi_keluar"("id_menu");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_user_tanggal_transaksi_idx" ON "public"."transaksi_keluar"("id_user", "tanggal_transaksi");

-- CreateIndex
CREATE INDEX "notifikasi_id_user_tanggal_idx" ON "public"."notifikasi"("id_user", "tanggal");

-- CreateIndex
CREATE INDEX "notifikasi_id_role_tujuan_sudah_dibaca_idx" ON "public"."notifikasi"("id_role_tujuan", "sudah_dibaca");

-- CreateIndex
CREATE UNIQUE INDEX "menu_kode_menu_key" ON "public"."menu"("kode_menu");

-- CreateIndex
CREATE UNIQUE INDEX "unique_menu_stok" ON "public"."resep"("id_menu", "id_stok");

-- CreateIndex
CREATE INDEX "audit_log_entitas_id_entitas_idx" ON "public"."audit_log"("entitas", "id_entitas");

-- CreateIndex
CREATE INDEX "audit_log_id_user_created_at_idx" ON "public"."audit_log"("id_user", "created_at");

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "public"."roles"("id_role") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stok" ADD CONSTRAINT "stok_id_pemasok_fkey" FOREIGN KEY ("id_pemasok") REFERENCES "public"."pemasok"("id_pemasok") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."stok" ADD CONSTRAINT "stok_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pemasok" ADD CONSTRAINT "pemasok_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_masuk" ADD CONSTRAINT "transaksi_masuk_id_stok_fkey" FOREIGN KEY ("id_stok") REFERENCES "public"."stok"("id_stok") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_masuk" ADD CONSTRAINT "transaksi_masuk_id_pemasok_fkey" FOREIGN KEY ("id_pemasok") REFERENCES "public"."pemasok"("id_pemasok") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_masuk" ADD CONSTRAINT "transaksi_masuk_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_stok_fkey" FOREIGN KEY ("id_stok") REFERENCES "public"."stok"("id_stok") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_menu_fkey" FOREIGN KEY ("id_menu") REFERENCES "public"."menu"("id_menu") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi" ADD CONSTRAINT "notifikasi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi" ADD CONSTRAINT "notifikasi_id_stok_fkey" FOREIGN KEY ("id_stok") REFERENCES "public"."stok"("id_stok") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi" ADD CONSTRAINT "notifikasi_id_role_tujuan_fkey" FOREIGN KEY ("id_role_tujuan") REFERENCES "public"."roles"("id_role") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resep" ADD CONSTRAINT "resep_id_menu_fkey" FOREIGN KEY ("id_menu") REFERENCES "public"."menu"("id_menu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resep" ADD CONSTRAINT "resep_id_stok_fkey" FOREIGN KEY ("id_stok") REFERENCES "public"."stok"("id_stok") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_log" ADD CONSTRAINT "audit_log_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "public"."users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

