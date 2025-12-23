-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT[],
    "price" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeProduct" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "AttributeProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AttributeProduct" ADD CONSTRAINT "AttributeProduct_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
