/*
  Warnings:

  - You are about to drop the `offer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "offer";

-- CreateTable
CREATE TABLE "Constants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boolean" BOOLEAN NOT NULL,

    CONSTRAINT "Constants_pkey" PRIMARY KEY ("id")
);
