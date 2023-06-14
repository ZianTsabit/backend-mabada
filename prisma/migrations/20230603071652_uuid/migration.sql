/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "product" ADD COLUMN     "uuid" UUID NOT NULL DEFAULT uuid_generate_v4();

-- CreateIndex
CREATE UNIQUE INDEX "uuidp" ON "product"("uuid");
