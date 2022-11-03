/*
  Warnings:

  - Made the column `statusPacienteId` on table `Paciente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Paciente" ALTER COLUMN "statusPacienteId" SET NOT NULL;
