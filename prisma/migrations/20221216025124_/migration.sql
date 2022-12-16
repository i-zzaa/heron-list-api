/*
  Warnings:

  - You are about to drop the column `carga_horaria` on the `terapeuta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `terapeuta` DROP COLUMN `carga_horaria`,
    ADD COLUMN `cargaHoraria` JSON NULL;
