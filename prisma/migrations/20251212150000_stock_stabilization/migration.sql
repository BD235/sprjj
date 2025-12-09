-- Stabilize stok/resipe/transaksi sesuai desain base-unit

-- Enums
CREATE TYPE "public"."Satuan" AS ENUM ('GRAM', 'ML', 'PCS');
CREATE TYPE "public"."TipeKeluar" AS ENUM ('RESEP', 'RUSAK', 'EXP', 'LAINNYA');

-- stok_minimal untuk threshold low-stock (diisi dari sisa_stok lama jika ada)
ALTER TABLE "public"."stok" ADD COLUMN "stok_minimal" INTEGER NOT NULL DEFAULT 0;
UPDATE "public"."stok" SET "stok_minimal" = COALESCE("sisa_stok", 0);

-- Pastikan kategori ada nilai (default "Uncategorized")
UPDATE "public"."stok" SET "kategori" = COALESCE("kategori", 'Uncategorized');

-- Jadikan sisa_stok sebagai stok berjalan (ambil dari jumlah jika kosong)
UPDATE "public"."stok" SET "sisa_stok" = COALESCE("jumlah", 0);
ALTER TABLE "public"."stok" ALTER COLUMN "sisa_stok" SET DEFAULT 0;
ALTER TABLE "public"."stok" ALTER COLUMN "sisa_stok" SET NOT NULL;

-- jumlah tetap ada sebagai stok_awal/riwayat
ALTER TABLE "public"."stok" ALTER COLUMN "jumlah" SET DEFAULT 0;
ALTER TABLE "public"."stok" ALTER COLUMN "jumlah" SET NOT NULL;

-- kategori wajib dan punya default
ALTER TABLE "public"."stok" ALTER COLUMN "kategori" SET DEFAULT 'Uncategorized';
ALTER TABLE "public"."stok" ALTER COLUMN "kategori" SET NOT NULL;

-- Ganti enum satuan → Satuan (hilangkan KG, konversi ke GRAM)
ALTER TABLE "public"."stok" ALTER COLUMN "satuan" DROP DEFAULT;
ALTER TABLE "public"."stok"
  ALTER COLUMN "satuan" TYPE "public"."Satuan"
  USING (
    CASE
      WHEN "satuan"::text = 'KG' THEN 'GRAM'::"public"."Satuan"
      ELSE "satuan"::text::"public"."Satuan"
    END
  );
ALTER TABLE "public"."stok" ALTER COLUMN "satuan" SET DEFAULT 'GRAM';
DROP TYPE IF EXISTS "public"."MeasurementUnit";

-- Tambahkan tipe keluar di transaksi_keluar
ALTER TABLE "public"."transaksi_keluar"
  ADD COLUMN "tipe_keluar" "public"."TipeKeluar" NOT NULL DEFAULT 'LAINNYA';
