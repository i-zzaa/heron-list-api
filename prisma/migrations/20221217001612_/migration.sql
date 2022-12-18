/*
  Warnings:

  - You are about to drop the column `comissao` on the `terapeuta` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `terapeuta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `terapeuta` DROP COLUMN `comissao`,
    DROP COLUMN `tipo`,
    MODIFY `fazDevolutiva` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `terapeutaonfuncao` ADD COLUMN `comissao` JSON NULL,
    ADD COLUMN `tipo` VARCHAR(191) NULL DEFAULT 'fixo';
