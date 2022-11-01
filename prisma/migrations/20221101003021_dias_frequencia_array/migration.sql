/*
  Warnings:

  - The `diasFrequencia` column on the `Calendario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `intervaloId` on table `Calendario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Calendario" DROP COLUMN "diasFrequencia",
ADD COLUMN     "diasFrequencia" INTEGER[],
ALTER COLUMN "intervaloId" SET NOT NULL;
