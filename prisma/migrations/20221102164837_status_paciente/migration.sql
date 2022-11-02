-- AlterTable
ALTER TABLE "Paciente" ADD COLUMN     "statusPacienteId" INTEGER;

-- CreateTable
CREATE TABLE "StatusPaciente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "StatusPaciente_pkey" PRIMARY KEY ("id")
);
