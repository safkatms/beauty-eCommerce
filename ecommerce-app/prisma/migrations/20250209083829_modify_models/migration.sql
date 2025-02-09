/*
  Warnings:

  - You are about to drop the column `color` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_name_brandId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "color",
ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quantity" INTEGER;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "shade" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
