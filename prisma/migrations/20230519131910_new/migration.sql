/*
  Warnings:

  - You are about to drop the column `name` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `userproduct` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "media" DROP COLUMN "name";

-- AlterTable
ALTER TABLE "userproduct" DROP COLUMN "quantity";
