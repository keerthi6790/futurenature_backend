/*
  Warnings:

  - A unique constraint covering the columns `[addedById]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Review_addedById_key" ON "Review"("addedById");
