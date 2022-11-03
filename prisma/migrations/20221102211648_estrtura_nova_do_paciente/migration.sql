/*
  Warnings:

  - You are about to drop the column `dataVoltouAba` on the `Vaga` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `Vaga` table. All the data in the column will be lost.
  - You are about to drop the column `tipoSessaoId` on the `Vaga` table. All the data in the column will be lost.
  - Added the required column `tipoSessaoId` to the `Paciente` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "statusId" INTEGER,
ADD COLUMN     "tipoSessaoId" INTEGER NOT NULL,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Vaga" DROP COLUMN "dataVoltouAba",
DROP COLUMN "statusId",
DROP COLUMN "tipoSessaoId";

-- AlterTable
ALTER TABLE "VagaOnEspecialidade" ADD COLUMN     "periodoId" INTEGER;

-- CreateTable
CREATE TABLE "VagaTerapia" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "periodoId" INTEGER NOT NULL,
    "dataVoltouAba" TEXT NOT NULL,
    "observacao" TEXT NOT NULL,
    "naFila" BOOLEAN NOT NULL DEFAULT true,
    "dataSaiuFila" TEXT,
    "diff" TEXT,

    CONSTRAINT "VagaTerapia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VagaTerapiaOnEspecialidade" (
    "especialidadeId" INTEGER NOT NULL,
    "vagaId" INTEGER NOT NULL,
    "agendado" BOOLEAN NOT NULL DEFAULT false,
    "dataAgendado" TEXT,

    CONSTRAINT "VagaTerapiaOnEspecialidade_pkey" PRIMARY KEY ("vagaId","especialidadeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "VagaTerapia_pacienteId_key" ON "VagaTerapia"("pacienteId");
