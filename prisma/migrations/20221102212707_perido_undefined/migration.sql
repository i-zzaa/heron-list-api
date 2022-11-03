/*
  Warnings:

  - Made the column `periodoId` on table `Vaga` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Vaga" ALTER COLUMN "periodoId" SET NOT NULL;
