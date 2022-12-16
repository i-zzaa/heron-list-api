/*
  Warnings:

  - You are about to drop the `comissao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessao` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `terapeuta` ADD COLUMN `carga_horaria` JSON NULL,
    ADD COLUMN `comissao` VARCHAR(191) NOT NULL DEFAULT '80',
    ADD COLUMN `tipo` VARCHAR(191) NOT NULL DEFAULT 'fixo';

-- AlterTable
ALTER TABLE `vagaterapiaonespecialidade` ADD COLUMN `km` VARCHAR(191) NOT NULL DEFAULT '0',
    ADD COLUMN `valor` VARCHAR(191) NOT NULL DEFAULT '200';

-- DropTable
DROP TABLE `comissao`;

-- DropTable
DROP TABLE `sessao`;
