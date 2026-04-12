-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "label" TEXT NOT NULL DEFAULT 'Home',
ADD COLUMN     "receiverName" TEXT;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "shippingPrice" TEXT NOT NULL DEFAULT '0';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingPrice" TEXT NOT NULL DEFAULT '0';
