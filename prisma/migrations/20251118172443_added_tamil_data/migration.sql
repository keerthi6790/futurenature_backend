/*
  Warnings:

  - Added the required column `discounted_amount` to the `AttributeProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discounted_type` to the `AttributeProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selling_price` to the `AttributeProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_tamil` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discounted_amount` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discounted_type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name_tamil` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selling_price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttributeProduct" ADD COLUMN     "discounted_amount" TEXT NOT NULL,
ADD COLUMN     "discounted_type" TEXT NOT NULL,
ADD COLUMN     "selling_price" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description_tamil" TEXT NOT NULL,
ADD COLUMN     "discounted_amount" TEXT NOT NULL,
ADD COLUMN     "discounted_type" TEXT NOT NULL,
ADD COLUMN     "product_name_tamil" TEXT NOT NULL,
ADD COLUMN     "selling_price" TEXT NOT NULL;
