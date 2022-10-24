/*
  Warnings:

  - You are about to drop the column `funcao` on the `funcao` table. All the data in the column will be lost.
  - Added the required column `nome` to the `Funcao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `funcao` DROP COLUMN `funcao`,
    ADD COLUMN `nome` VARCHAR(191) NOT NULL;
