/*
  Warnings:

  - You are about to drop the column `nome` on the `funcao` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `localidade` table. All the data in the column will be lost.
  - Added the required column `especialidadeId` to the `Funcao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `funcao` to the `Funcao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `casa` to the `Localidade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sala` to the `Localidade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `funcao` DROP COLUMN `nome`,
    ADD COLUMN `especialidadeId` INTEGER NOT NULL,
    ADD COLUMN `funcao` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `localidade` DROP COLUMN `nome`,
    ADD COLUMN `casa` VARCHAR(191) NOT NULL,
    ADD COLUMN `sala` VARCHAR(191) NOT NULL;
