/*
  Warnings:

  - You are about to drop the column `data` on the `calendario` table. All the data in the column will be lost.
  - Added the required column `dataFim` to the `Calendario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataInicio` to the `Calendario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `observacao` to the `Calendario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `calendario` DROP COLUMN `data`,
    ADD COLUMN `dataFim` VARCHAR(191) NOT NULL,
    ADD COLUMN `dataInicio` VARCHAR(191) NOT NULL,
    ADD COLUMN `observacao` VARCHAR(191) NOT NULL;
