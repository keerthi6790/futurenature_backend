/*
  Warnings:

  - You are about to drop the column `hashed_password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Banner` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashed_password",
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "isWhatsappOptIn" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Banner";
