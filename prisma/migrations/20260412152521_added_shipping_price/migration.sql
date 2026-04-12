/*
  Warnings:

  - Added the required column `addressId` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "addressId" TEXT NOT NULL,
ADD COLUMN     "shippingPrice" TEXT NOT NULL DEFAULT '0';

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
