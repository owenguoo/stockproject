/*
  Warnings:

  - You are about to drop the column `price` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `total` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "price",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;
