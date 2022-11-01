/*
  Warnings:

  - The primary key for the `Terapeuta` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Terapeuta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Terapeuta" DROP CONSTRAINT "Terapeuta_pkey",
DROP COLUMN "id";
