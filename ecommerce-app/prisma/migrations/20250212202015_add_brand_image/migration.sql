/*
  Warnings:

  - You are about to alter the column `purchasePrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `sellingPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to alter the column `discount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.
  - You are about to alter the column `priceAfterDiscount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "purchasePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "sellingPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "discount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "priceAfterDiscount" SET DATA TYPE DOUBLE PRECISION;
